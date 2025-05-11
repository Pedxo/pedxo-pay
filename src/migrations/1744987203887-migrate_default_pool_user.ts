import { User } from "src/modules/account/entities/user.entity";
import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrateDefaultPoolUser1744987203887 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(User)
      .values({
        email: process.env.DEFAUL_MAIL,
        first_name: "Pedxopay",
        last_name: "Pool",
      })
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
