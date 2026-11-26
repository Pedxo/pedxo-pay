import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Account } from "src/modules/account/entities/account.entity";
import { AccountTypes, Currency } from "src/modules/account/dto/account.dto";
import { CURRENCY_SYMBOLS } from "src/modules/account/wallet-currencies";

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

    return accounts.map((acc) => {
      const numBal = parseFloat(acc.balance?.toString() || "0");
      const symbol = CURRENCY_SYMBOLS[acc.currency] || `${acc.currency} `;
      const amount = numBal.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return {
        id: acc.id,
        account_number: acc.account_number,
        account_name: acc.account_name,
        currency: acc.currency,
        symbol: symbol.trim(),
        balance: numBal,
        // Ledger credit display: currency symbol/code in front of the digits
        formatted_balance: `${symbol}${amount}`.replace(/\s+/g, " ").trim(),
      };
    });
  }

  async getDepositInfo(currency: Currency = Currency.USD) {
    const depositDetails: Record<string, any> = {
      USD: {
        currency: "USD",
        instruction:
          "Manual USD top-up: after funds are confirmed, an operator credits your Pedxo ledger balance (database credit, not a live bank API).",
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
        instruction:
          "Manual NGN top-up: after transfer is confirmed, your NGN wallet credit is updated in Pedxo Pay.",
        bank_name: "Providus Bank",
        account_name: "Pedxo Technologies",
        account_number: "1100234567",
        account_type: "Corporate",
      },
      GBP: {
        currency: "GBP",
        instruction:
          "Manual GBP top-up: after transfer is confirmed, your GBP wallet credit is updated in Pedxo Pay.",
        bank_name: "Barclays Bank UK",
        account_name: "Pedxo Technologies UK",
        sort_code: "20-04-15",
        account_number: "73829104",
      },
      EUR: {
        currency: "EUR",
        instruction:
          "Manual EUR top-up: after SEPA is confirmed, your EUR wallet credit is updated in Pedxo Pay.",
        bank_name: "BNP Paribas",
        account_name: "Pedxo Technologies Europe",
        iban: "FR7630006000011234567890189",
        bic_swift: "BNPAFR2X",
      },
      USDT: {
        currency: "USDT",
        instruction:
          "Manual USDT top-up: send USDT to the Pedxo treasury address; an operator credits your USDT ledger balance.",
        network: "Polygon / Ethereum (confirm with support)",
        asset: "USDT",
        note: "This is ledger credit in Pedxo Pay, not an on-chain auto-deposit API.",
      },
      USDC: {
        currency: "USDC",
        instruction:
          "Manual USDC top-up: send USDC to the Pedxo treasury address; an operator credits your USDC ledger balance.",
        network: "Polygon / Ethereum (confirm with support)",
        asset: "USDC",
        note: "This is ledger credit in Pedxo Pay, not an on-chain auto-deposit API.",
      },
    };

    return depositDetails[currency] || depositDetails.USD;
  }
}
