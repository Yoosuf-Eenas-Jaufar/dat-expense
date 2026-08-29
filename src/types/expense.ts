export type Currency = 'MVR' | 'USD' | 'EUR';

export type ExpenseSource = 'manual' | 'sms';

export interface Expense {
  id: string;

  originalAmount: number;
  originalCurrency: Currency;

  exchangeRateToMVR: number;
  amountMVR: number;

  merchant: string;
  categoryId: string;

  transactionDateTime: string;
  source: ExpenseSource;

  referenceNumber?: string;
  approvalCode?: string;
  accountSuffix?: string;

  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isProtected?: boolean;
}

export interface MerchantRule {
  id: string;

  merchantKey: string;
  displayMerchantName: string;

  categoryId: string;

  createdAt: string;
  updatedAt: string;
}

export interface ParsedPaymentTransaction {
  accountSuffix: string;

  transactionDateTime: string;

  originalAmount: number;
  originalCurrency: Currency;

  merchant: string;

  referenceNumber: string;
  approvalCode: string;
}