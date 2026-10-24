import { Account } from "src/modules/account/entities/account.entity";
import { User } from "src/modules/account/entities/user.entity";
import { MigrationInterface, QueryRunner } from "typeorm";

export class MigratePoolAccountsGbpEur1744987380812
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const pool = await queryRunner.manager
      .createQueryBuilder()
      .select("user.id")
      .from(User, "user")
      .where("email = :email", { email: process.env.DEFAUL_MAIL || "pedxopay@pedxopay.com" })
      .getOne();

    if (!pool) return;

    // Insert GBP pool account if not already present
    const existingGbp = await queryRunner.manager.findOne(Account, {
      where: { currency: "GBP", type: "pool" },
    });
    if (!existingGbp) {
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(Account)
        .values({
          account_name: "Pedxopay GBP",
          account_number: "9000000002",
          currency: "GBP",
          type: "pool",
          user_id: pool.id,
        })
        .execute();
    }

    // Insert EUR pool account if not already present
    const existingEur = await queryRunner.manager.findOne(Account, {
      where: { currency: "EUR", type: "pool" },
    });
    if (!existingEur) {
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(Account)
        .values({
          account_name: "Pedxopay EUR",
          account_number: "9000000003",
          currency: "EUR",
          type: "pool",
          user_id: pool.id,
        })
        .execute();
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
