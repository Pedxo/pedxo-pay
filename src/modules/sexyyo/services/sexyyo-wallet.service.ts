import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Account } from "src/modules/account/entities/account.entity";
import { AccountTypes, Currency } from "src/modules/account/dto/account.dto";

@Injectable()
export class SexyyoWalletService {
  constructor(
    @InjectRepository(Account) private accountRepo: Repository<Account>
  ) {}

  async getUserBalances(userId: number) {
    const accounts = await this.accountRepo.find({
      where: { user_id: userId, type: AccountTypes.SAVING },
      order: { id: "ASC" },
    });

    const currencySymbols: Record<string, string> = {
      USD: "$",
      NGN: "₦",
      GBP: "£",
      EUR: "€",
    };

    return accounts.map((acc) => {
      const numBal = parseFloat(acc.balance?.toString() || "0");
      const symbol = currencySymbols[acc.currency] || acc.currency;
      return {
        id: acc.id,
        account_number: acc.account_number,
        account_name: acc.account_name,
        currency: acc.currency,
        symbol,
        balance: numBal,
        formatted_balance: `${symbol}${numBal.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      };
    });
  }

  async getDepositInfo(currency: Currency = Currency.USD) {
    const depositDetails: Record<string, any> = {
      USD: {
        currency: "USD",
        instruction: "Transfer USD into this bank account to fund your wallet",
        bank_name: "Lead Bank",
        account_name: "Victor Chukwuma",
        account_number: "210328641937",
        wire_routing: "101019644",
        ach_routing: "101019644",
        account_type: "Checking",
        bank_address: "1801 Main St., Kansas City, MO 64108",
      },
      NGN: {
        currency: "NGN",
        instruction: "Transfer Nigerian Naira (NGN) into this account to fund your wallet",
        bank_name: "Providus Bank",
        account_name: "Pedxo Technologies",
        account_number: "1100234567",
        account_type: "Corporate",
      },
      GBP: {
        currency: "GBP",
        instruction: "Transfer British Pounds (GBP) into this account to fund your wallet",
        bank_name: "Barclays Bank UK",
        account_name: "Pedxo Technologies UK",
        sort_code: "20-04-15",
        account_number: "73829104",
      },
      EUR: {
        currency: "EUR",
        instruction: "Transfer Euro (EUR) into this account via SEPA to fund your wallet",
        bank_name: "BNP Paribas",
        account_name: "Pedxo Technologies Europe",
        iban: "FR7630006000011234567890189",
        bic_swift: "BNPAFR2X",
      },
    };

    return depositDetails[currency] || depositDetails.USD;
  }
}
