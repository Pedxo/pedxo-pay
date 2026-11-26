import { Currency } from "./dto/account.dto";

/** Ledger wallets every Sexyyo user gets (credit digits + symbol, not a bank API). */
export const SEXYYO_WALLET_CURRENCIES: Currency[] = [
  Currency.USD,
  Currency.GBP,
  Currency.NGN,
  Currency.USDT,
  Currency.USDC,
  Currency.EUR,
];

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  GBP: "£",
  NGN: "₦",
  USDT: "USDT ",
  USDC: "USDC ",
  EUR: "€",
};

export const CURRENCY_ENUM_SQL_VALUES = [
  "NGN",
  "USD",
  "GBP",
  "EUR",
  "USDT",
  "USDC",
] as const;
