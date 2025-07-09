import { Account } from "src/modules/account/entities/account.entity";
import { User } from "src/modules/account/entities/user.entity";
import { createQueryBuilder, MigrationInterface, QueryRunner } from "typeorm";

export class MigrateDefaultPoolAccount1744987380811
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const pool = await queryRunner.manager
      .createQueryBuilder()
      .select("user.id")
      .from(User, "user")
      .where("email = :email", { email: process.env.DEFAUL_MAIL })
      .getOne();
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(Account)
      .values({
        account_name: "Pedxopay NGN",
        account_number: process.env.ACC_NUM_POOL_SAVING || "9000000000",
        currency: "NGN",
        type: "pool",
        user_id: pool.id,
      })
      .execute();

    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(Account)
      .values({
        account_name: "Pedxopay USD",
        account_number: process.env.ACC_NUM_POOL_SAVING || "9000000001",
        currency: "USD",
        type: "pool",
        user_id: pool.id,
      })
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
