import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, Min } from "class-validator";
import { Currency } from "src/modules/account/dto/account.dto";

export class SexyyoCheckoutDto {
  @IsNumber()
  @IsPositive({ message: "Checkout amount must be greater than zero." })
  amount: number;

  @IsEnum(Currency, { message: "Currency must be one of: NGN, USD, GBP, EUR" })
  currency: Currency;

  @IsNotEmpty({ message: "Order ID or checkout reference is required." })
  order_id: string;

  @IsOptional()
  narration?: string;

  @IsOptional()
  pin?: string;
}

export class SexyyoDepositDto {
  @IsNotEmpty()
  account_number: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsOptional()
  reference?: string;

  @IsOptional()
  narration?: string;
}

export class SexyyoTransferDto {
  @IsNotEmpty()
  recipient_account_number: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsOptional()
  narration?: string;

  @IsOptional()
  pin?: string;
}

export class SexyyoWithdrawDto {
  @IsEnum(Currency)
  currency: Currency;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNotEmpty()
  destination_type: "bank" | "crypto";

  @IsNotEmpty()
  destination_account: string; // Bank account number or crypto wallet address

  @IsOptional()
  bank_name?: string;

  @IsOptional()
  crypto_network?: string; // Solana, Ethereum, Polygon

  @IsOptional()
  narration?: string;

  @IsOptional()
  pin?: string;
}
