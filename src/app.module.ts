import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AccountModule } from "./modules/account/account.module";
import { TransactionsModule } from "./modules/transactions/transactions.module";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";

import { ConfigModule, ConfigService } from "@nestjs/config";
import { appConfig } from "./config/app.config";
import { appConfigSchema, ConfigType } from "./config/config.types";
import { typeormConfig } from "./config/typeorm.config";

const configModule = ConfigModule.forRoot({
  load: [appConfig, typeormConfig],
  validationSchema: appConfigSchema,
  validationOptions: { abortEarly: true },
  isGlobal: true,
});
const typeOrmModuel = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService<ConfigType>) => ({
    ...configService.get("typeorm"),
  }),
});

@Module({
  imports: [configModule, typeOrmModuel, AccountModule, TransactionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
