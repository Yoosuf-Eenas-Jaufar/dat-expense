import type { ParsedPaymentTransaction } from '@/types/expense';

const PAYMENT_MESSAGE_PATTERN =
  /^Transaction from\s+(\d+)\s+on\s+(\d{2})\/(\d{2})\/(\d{2})\s+at\s+(\d{2}):(\d{2}):(\d{2})\s+for\s+(MVR|USD|EUR)\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)\s+at\s+(.+?)\s+was processed\.\s+Reference No:\s*(\d+),\s*Approval Code:\s*(\d+)\.?$/i;

export function normalizeMerchantName(merchant: string): string {
  return merchant.replace(/\s+/g, ' ').trim();
}

export function merchantKey(merchant: string): string {
  return normalizeMerchantName(merchant).toUpperCase();
}

export function parsePaymentMessage(
  message: string
): ParsedPaymentTransaction | null {
  const match = message.trim().match(PAYMENT_MESSAGE_PATTERN);

  if (!match) {
    return null;
  }

  const [
    ,
    accountSuffix,
    day,
    month,
    shortYear,
    hour,
    minute,
    second,
    currency,
    rawAmount,
    rawMerchant,
    referenceNumber,
    approvalCode,
  ] = match;

  const year = 2000 + Number(shortYear);

  const date = new Date(
    year,
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const amount = Number(rawAmount.replace(/,/g, ''));

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return {
    accountSuffix,
    transactionDateTime: date.toISOString(),

    originalAmount: amount,
    originalCurrency:
      currency.toUpperCase() as ParsedPaymentTransaction['originalCurrency'],

    merchant: normalizeMerchantName(rawMerchant),

    referenceNumber,
    approvalCode,
  };
}