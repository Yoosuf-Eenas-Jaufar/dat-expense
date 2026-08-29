import { parsePaymentMessage } from '@/services/transaction-parser';
import type { ExpenseStore } from '@/stores/expense-store';

export type ImportPaymentResult =
  | {
      success: true;
      status: 'imported';
      merchant: string;
      referenceNumber: string;
    }
  | {
      success: false;
      status: 'invalid' | 'duplicate' | 'exchange-rate-required';
      message: string;
    };

export function importPaymentMessage(
  message: string,
  expenseStore: ExpenseStore,
  exchangeRateToMVR?: number
): ImportPaymentResult {
  const parsed = parsePaymentMessage(message);

  if (!parsed) {
    return {
      success: false,
      status: 'invalid',
      message: 'This does not match a supported 455 payment message.',
    };
  }

  if (expenseStore.hasReferenceNumber(parsed.referenceNumber)) {
    return {
      success: false,
      status: 'duplicate',
      message: `Reference ${parsed.referenceNumber} has already been imported.`,
    };
  }

  let rateToMVR = 1;

  if (parsed.originalCurrency !== 'MVR') {
    if (
      exchangeRateToMVR === undefined ||
      !Number.isFinite(exchangeRateToMVR) ||
      exchangeRateToMVR <= 0
    ) {
      return {
        success: false,
        status: 'exchange-rate-required',
        message: `An MVR exchange rate is required for ${parsed.originalCurrency}.`,
      };
    }

    rateToMVR = exchangeRateToMVR;
  }

  const importedExpense = expenseStore.importParsedTransaction(
    parsed,
    rateToMVR
  );

  if (!importedExpense) {
    return {
      success: false,
      status: 'duplicate',
      message: `Reference ${parsed.referenceNumber} has already been imported.`,
    };
  }

  return {
    success: true,
    status: 'imported',
    merchant: parsed.merchant,
    referenceNumber: parsed.referenceNumber,
  };
}