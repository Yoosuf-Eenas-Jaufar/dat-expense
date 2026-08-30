import { getExchangeRateToMVR } from '@/services/exchange-rate-service';
import { parsePaymentMessage } from '@/services/transaction-parser';
import type { ExpenseStore } from '@/stores/expense-store';

export interface CurrentMonthImportResult {
  totalMessages: number;
  imported: number;
  alreadyScanned: number;
  invalid: number;
  outsideCurrentMonth: number;
  exchangeRateRequired: number;
}

function isInCurrentMonth(
  dateString: string
): boolean {
  const transactionDate =
    new Date(dateString);

  const now = new Date();

  return (
    transactionDate.getFullYear() ===
      now.getFullYear() &&
    transactionDate.getMonth() ===
      now.getMonth()
  );
}

export async function importCurrentMonthMessages(
  messages: string[],
  expenseStore: ExpenseStore
): Promise<CurrentMonthImportResult> {
  const result: CurrentMonthImportResult = {
    totalMessages: messages.length,
    imported: 0,
    alreadyScanned: 0,
    invalid: 0,
    outsideCurrentMonth: 0,
    exchangeRateRequired: 0,
  };

  for (const message of messages) {
    const parsed =
      parsePaymentMessage(message);

    if (!parsed) {
      result.invalid += 1;
      continue;
    }

    if (
      !isInCurrentMonth(
        parsed.transactionDateTime
      )
    ) {
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

    const exchangeRateToMVR =
      await getExchangeRateToMVR(
        parsed.originalCurrency,
        parsed.transactionDateTime
      );

    if (
      exchangeRateToMVR === null ||
      !Number.isFinite(exchangeRateToMVR) ||
      exchangeRateToMVR <= 0
    ) {
      result.exchangeRateRequired += 1;
      continue;
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