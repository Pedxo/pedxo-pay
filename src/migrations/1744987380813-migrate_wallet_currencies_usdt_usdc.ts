import { Account } from "src/modules/account/entities/account.entity";
import { User } from "src/modules/account/entities/user.entity";
import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Expand account.currency enum for production Sexyyo wallets
 * (USD, GBP, NGN, USDT, USDC, EUR) and seed USDT/USDC pool accounts.
 * Balances are ledger credit digits — not a live bank API.
 */
export class MigrateWalletCurrenciesUsdtUsdc1744987380813
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`account\`
      MODIFY COLUMN \`currency\`
      ENUM('NGN', 'USD', 'GBP', 'EUR', 'USDT', 'USDC')
      NOT NULL
      DEFAULT 'NGN'
    `);

    const pool = await queryRunner.manager
      .createQueryBuilder()
      .select("user.id")
      .from(User, "user")
      .where("email = :email", {
        email: process.env.DEFAUL_MAIL || "pedxopay@pedxopay.com",
      })
      .getOne();

    if (!pool) return;

    const poolsToEnsure: Array<{
      currency: string;
      account_name: string;
      account_number: string;
    }> = [
      {
        currency: "USDT",
        account_name: "Pedxopay USDT",
        account_number: "9000000004",
      },
      {
        currency: "USDC",
        account_name: "Pedxopay USDC",
        account_number: "9000000005",
      },
    ];

    for (const poolAcc of poolsToEnsure) {
      const existing = await queryRunner.manager.findOne(Account, {
        where: { currency: poolAcc.currency, type: "pool" },
      });
      if (existing) continue;

      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(Account)
        .values({
          account_name: poolAcc.account_name,
          account_number: poolAcc.account_number,
          currency: poolAcc.currency,
          type: "pool",
          user_id: pool.id,
          balance: 0,
        })
        .execute();
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Keep USDT/USDC rows; shrinking ENUM would fail if those rows remain.
    await queryRunner.query(`
      ALTER TABLE \`account\`
      MODIFY COLUMN \`currency\`
      ENUM('NGN', 'USD', 'GBP', 'EUR')
      NOT NULL
      DEFAULT 'NGN'
    `);
  }
}
