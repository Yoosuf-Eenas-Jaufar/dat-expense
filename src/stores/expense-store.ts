import { makeAutoObservable } from 'mobx';
import { hydrateStore, makePersistable } from 'mobx-persist-store';

import { merchantKey } from '@/services/transaction-parser';

import type {
  Category,
  Currency,
  Expense,
  MerchantRule,
  ParsedPaymentTransaction,
} from '@/types/expense';

import type { PVoid } from './types';

export const UNCATEGORIZED_CATEGORY_ID = 'uncategorized';

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: UNCATEGORIZED_CATEGORY_ID,
    name: 'Uncategorized',
    icon: 'help-circle',
    color: '#8E8E93',
    isProtected: true,
  },

  {
    id: 'food',
    name: 'Food',
    icon: 'restaurant',
    color: '#FF9500',
  },

  {
    id: 'groceries',
    name: 'Groceries',
    icon: 'cart',
    color: '#34C759',
  },

  {
    id: 'transport',
    name: 'Transport',
    icon: 'car',
    color: '#007AFF',
  },

  {
    id: 'shopping',
    name: 'Shopping',
    icon: 'bag',
    color: '#AF52DE',
  },

  {
    id: 'bills',
    name: 'Bills',
    icon: 'receipt',
    color: '#FF3B30',
  },

  {
    id: 'subscriptions',
    name: 'Subscriptions',
    icon: 'repeat',
    color: '#5856D6',
  },

  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'game-controller',
    color: '#FF2D55',
  },

  {
    id: 'health',
    name: 'Health',
    icon: 'medkit',
    color: '#30B0C7',
  },

  {
    id: 'education',
    name: 'Education',
    icon: 'book',
    color: '#5AC8FA',
  },

  {
    id: 'other',
    name: 'Other',
    icon: 'ellipsis-horizontal',
    color: '#636366',
  },
];

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function cloneDefaultCategories(): Category[] {
  return DEFAULT_CATEGORIES.map(category => ({
    ...category,
  }));
}

function isSameMonth(
  dateString: string,
  comparisonDate: Date
): boolean {
  const date = new Date(dateString);

  return (
    date.getFullYear() === comparisonDate.getFullYear() &&
    date.getMonth() === comparisonDate.getMonth()
  );
}

export class ExpenseStore {
  expenses: Expense[] = [];

  categories: Category[] = cloneDefaultCategories();

  merchantRules: MerchantRule[] = [];

  lastSuccessfulSmsScanAt: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });

    makePersistable(this, {
      name: 'DatExpenseStoreV1',

      properties: [
        'expenses',
        'categories',
        'merchantRules',
        'lastSuccessfulSmsScanAt',
      ],

      debugMode: false,
    });
  }

  get currentMonthExpenses(): Expense[] {
    const now = new Date();

    return this.expenses
      .filter(expense =>
        isSameMonth(expense.transactionDateTime, now)
      )
      .sort(
        (a, b) =>
          new Date(b.transactionDateTime).getTime() -
          new Date(a.transactionDateTime).getTime()
      );
  }

  get currentMonthTotalMVR(): number {
    return this.currentMonthExpenses.reduce(
      (total, expense) => total + expense.amountMVR,
      0
    );
  }

  get recentTransactions(): Expense[] {
    return this.currentMonthExpenses.slice(0, 5);
  }

  getCategory(
    categoryId: string
  ): Category | undefined {
    return this.categories.find(
      category => category.id === categoryId
    );
  }

  hasReferenceNumber(
    referenceNumber: string
  ): boolean {
    return this.expenses.some(
      expense =>
        expense.referenceNumber === referenceNumber
    );
  }

  categoryIdForMerchant(
    merchant: string
  ): string {
    const key = merchantKey(merchant);

    const rule = this.merchantRules.find(
      item => item.merchantKey === key
    );

    return (
      rule?.categoryId ??
      UNCATEGORIZED_CATEGORY_ID
    );
  }

  addManualExpense(input: {
    amount: number;
    currency: Currency;
    exchangeRateToMVR: number;
    merchant: string;
    categoryId?: string;
    transactionDateTime?: string;
  }): Expense {
    if (
      !Number.isFinite(input.amount) ||
      input.amount <= 0
    ) {
      throw new Error(
        'Amount must be greater than zero.'
      );
    }

    if (
      !Number.isFinite(input.exchangeRateToMVR) ||
      input.exchangeRateToMVR <= 0
    ) {
      throw new Error(
        'Exchange rate must be greater than zero.'
      );
    }

    const merchant = input.merchant
      .replace(/\s+/g, ' ')
      .trim();

    if (!merchant) {
      throw new Error(
        'Merchant is required.'
      );
    }

    const categoryId =
      input.categoryId &&
      this.getCategory(input.categoryId)
        ? input.categoryId
        : UNCATEGORIZED_CATEGORY_ID;

    const now = new Date().toISOString();

    const expense: Expense = {
      id: createId('expense'),

      originalAmount: input.amount,
      originalCurrency: input.currency,

      exchangeRateToMVR:
        input.exchangeRateToMVR,

      amountMVR:
        input.amount *
        input.exchangeRateToMVR,

      merchant,
      categoryId,

      transactionDateTime:
        input.transactionDateTime ?? now,

      source: 'manual',

      createdAt: now,
    };

    this.expenses.push(expense);

    return expense;
  }

  importParsedTransaction(
    transaction: ParsedPaymentTransaction,
    exchangeRateToMVR: number
  ): Expense | null {
    if (
      this.hasReferenceNumber(
        transaction.referenceNumber
      )
    ) {
      return null;
    }

    if (
      !Number.isFinite(exchangeRateToMVR) ||
      exchangeRateToMVR <= 0
    ) {
      throw new Error(
        'Exchange rate must be greater than zero.'
      );
    }

    const now = new Date().toISOString();

    const expense: Expense = {
      id: createId('expense'),

      originalAmount:
        transaction.originalAmount,

      originalCurrency:
        transaction.originalCurrency,

      exchangeRateToMVR,

      amountMVR:
        transaction.originalAmount *
        exchangeRateToMVR,

      merchant: transaction.merchant,

      categoryId:
        this.categoryIdForMerchant(
          transaction.merchant
        ),

      transactionDateTime:
        transaction.transactionDateTime,

      source: 'sms',

      referenceNumber:
        transaction.referenceNumber,

      approvalCode:
        transaction.approvalCode,

      accountSuffix:
        transaction.accountSuffix,

      createdAt: now,
    };

    this.expenses.push(expense);

    return expense;
  }

  assignCategory(
    expenseId: string,
    categoryId: string,
    rememberMerchant = false
  ): void {
    const expense =
      this.expenses.find(
        item => item.id === expenseId
      );

    if (
      !expense ||
      !this.getCategory(categoryId)
    ) {
      return;
    }

    expense.categoryId = categoryId;

    if (rememberMerchant) {
      this.rememberMerchantCategory(
        expense.merchant,
        categoryId
      );
    }
  }

  rememberMerchantCategory(
    merchant: string,
    categoryId: string
  ): void {
    if (!this.getCategory(categoryId)) {
      return;
    }

    const key = merchantKey(merchant);

    const now = new Date().toISOString();

    const existingRule =
      this.merchantRules.find(
        rule =>
          rule.merchantKey === key
      );

    if (existingRule) {
      existingRule.categoryId =
        categoryId;

      existingRule.displayMerchantName =
        merchant
          .replace(/\s+/g, ' ')
          .trim();

      existingRule.updatedAt = now;

      return;
    }

    this.merchantRules.push({
      id: createId('merchant-rule'),

      merchantKey: key,

      displayMerchantName:
        merchant
          .replace(/\s+/g, ' ')
          .trim(),

      categoryId,

      createdAt: now,
      updatedAt: now,
    });
  }

  addCategory(
    name: string,
    icon = 'pricetag',
    color = '#007AFF'
  ): Category {
    const cleanName = name
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanName) {
      throw new Error(
        'Category name is required.'
      );
    }

    const category: Category = {
      id: createId('category'),
      name: cleanName,
      icon,
      color,
    };

    this.categories.push(category);

    return category;
  }

  renameCategory(
    categoryId: string,
    name: string
  ): void {
    const category =
      this.getCategory(categoryId);

    const cleanName = name
      .replace(/\s+/g, ' ')
      .trim();

    if (!category || !cleanName) {
      return;
    }

    category.name = cleanName;
  }

  deleteCategory(
    categoryId: string
  ): void {
    const category =
      this.getCategory(categoryId);

    if (
      !category ||
      category.isProtected
    ) {
      return;
    }

    this.expenses.forEach(
      expense => {
        if (
          expense.categoryId ===
          categoryId
        ) {
          expense.categoryId =
            UNCATEGORIZED_CATEGORY_ID;
        }
      }
    );

    this.merchantRules =
      this.merchantRules.filter(
        rule =>
          rule.categoryId !==
          categoryId
      );

    this.categories =
      this.categories.filter(
        item =>
          item.id !== categoryId
      );
  }

  deleteExpense(
    expenseId: string
  ): void {
    this.expenses =
      this.expenses.filter(
        expense =>
          expense.id !== expenseId
      );
  }

  markSuccessfulSmsScan(): void {
    this.lastSuccessfulSmsScanAt =
      new Date().toISOString();
  }

  hydrate = async (): PVoid => {
    await hydrateStore(this);

    const hasUncategorized =
      this.categories.some(
        category =>
          category.id ===
          UNCATEGORIZED_CATEGORY_ID
      );

    if (!hasUncategorized) {
      this.categories.unshift({
        ...DEFAULT_CATEGORIES[0],
      });
    }
  };
}