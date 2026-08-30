import { parsePaymentMessage } from '@/services/transaction-parser';
import type { ExpenseStore } from '@/stores/expense-store';
import type { Currency } from '@/types/expense';

type ForeignCurrency = Exclude<Currency, 'MVR'>;

export type ExchangeRatesToMVR = Partial<
  Record<ForeignCurrency, number>
>;

export interface CurrentMonthImportResult {
  totalMessages: number;
  imported: number;
  alreadyScanned: number;
  invalid: number;
  outsideCurrentMonth: number;
  exchangeRateRequired: number;
}

function isInCurrentMonth(dateString: string): boolean {
  const transactionDate = new Date(dateString);
  const now = new Date();

  return (
    transactionDate.getFullYear() === now.getFullYear() &&
    transactionDate.getMonth() === now.getMonth()
  );
}

export function importCurrentMonthMessages(
  messages: string[],
  expenseStore: ExpenseStore,
  exchangeRates: ExchangeRatesToMVR = {}
): CurrentMonthImportResult {
  const result: CurrentMonthImportResult = {
    totalMessages: messages.length,
    imported: 0,
    alreadyScanned: 0,
    invalid: 0,
    outsideCurrentMonth: 0,
    exchangeRateRequired: 0,
  };

  for (const message of messages) {
    const parsed = parsePaymentMessage(message);

    if (!parsed) {
      result.invalid += 1;
      continue;
    }

    if (!isInCurrentMonth(parsed.transactionDateTime)) {
      result.outsideCurrentMonth += 1;
      continue;
    }

    if (
      expenseStore.hasReferenceNumber(
        parsed.referenceNumber
      )
    ) {
      result.alreadyScanned += 1;
      continue;
    }

    let exchangeRateToMVR = 1;

    if (parsed.originalCurrency !== 'MVR') {
      const rate =
        exchangeRates[parsed.originalCurrency];

      if (
        rate === undefined ||
        !Number.isFinite(rate) ||
        rate <= 0
      ) {
        result.exchangeRateRequired += 1;
        continue;
      }

      exchangeRateToMVR = rate;
    }

    const importedExpense =
      expenseStore.importParsedTransaction(
        parsed,
        exchangeRateToMVR
      );

    if (!importedExpense) {
      result.alreadyScanned += 1;
      continue;
    }

    result.imported += 1;
  }

  expenseStore.markSuccessfulSmsScan();

  return result;
}