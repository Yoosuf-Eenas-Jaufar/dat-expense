import type { Currency } from '@/types/expense';

type ForeignCurrency = Exclude<Currency, 'MVR'>;

interface CurrencyApiResponse {
  date?: string;
  [currency: string]:
    | string
    | Record<string, number>
    | undefined;
}

const rateCache = new Map<string, number>();

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function subtractDays(date: Date, days: number): Date {
  const result = new Date(date);

  result.setDate(result.getDate() - days);

  return result;
}

async function fetchRate(
  currency: ForeignCurrency,
  date: string
): Promise<number | null> {
  const baseCurrency = currency.toLowerCase();

  const urls = [
    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${date}/v1/currencies/${baseCurrency}.min.json`,

    `https://${date}.currency-api.pages.dev/v1/currencies/${baseCurrency}.min.json`,
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        continue;
      }

      const data =
        (await response.json()) as CurrencyApiResponse;

      const rates = data[baseCurrency];

      if (
        typeof rates !== 'object' ||
        rates === null
      ) {
        continue;
      }

      const rate = rates.mvr;

      if (
        typeof rate === 'number' &&
        Number.isFinite(rate) &&
        rate > 0
      ) {
        return rate;
      }
    } catch {
      // Try the fallback URL.
    }
  }

  return null;
}

export async function getExchangeRateToMVR(
  currency: Currency,
  transactionDateTime: string
): Promise<number | null> {
  if (currency === 'MVR') {
    return 1;
  }

  const transactionDate =
    new Date(transactionDateTime);

  if (Number.isNaN(transactionDate.getTime())) {
    return null;
  }

  // Some exchange-rate datasets do not publish
  // a new rate on weekends or holidays.
  //
  // Try the transaction date first, followed by
  // the previous seven days until a published
  // rate is found.
  for (let daysBack = 0; daysBack <= 7; daysBack += 1) {
    const candidateDate = subtractDays(
      transactionDate,
      daysBack
    );

    const dateString =
      formatLocalDate(candidateDate);

    const cacheKey =
      `${currency}-${dateString}`;

    const cachedRate =
      rateCache.get(cacheKey);

    if (cachedRate !== undefined) {
      return cachedRate;
    }

    const rate = await fetchRate(
      currency,
      dateString
    );

    if (rate !== null) {
      rateCache.set(cacheKey, rate);

      return rate;
    }
  }

  return null;
}