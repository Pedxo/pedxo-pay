import { DatabaseType, LoggerOptions } from "typeorm";
import { config as dotenvConfig } from "dotenv";
import { User } from "../modules/account/entities/user.entity";
import { Account } from "../modules/account/entities/account.entity";
import { Transactions } from "../modules/transactions/entities/transaction.entity";

dotenvConfig({ path: ".env" });

const useSsl = process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false;

const config = {
  app: {
    env: process.env.APP_ENV || "development",
    accNumPoolStart: process.env.ACC_NUM_POOL_START || "9000000000",
    accNumSavingStart: process.env.ACC_NUM_SAVING_START || "1000000000",
  },
  typeOrm: {
    type: (process.env.TYPEORM_CONNECTION || "mysql") as DatabaseType,
    host: process.env.DATABASE_HOST || "127.0.0.1",
    port: Number(process.env.DATABASE_PORT) || 3306,
    username: process.env.DATABASE_USERNAME || "root",
    password: process.env.DATABASE_PASSWORD || "root12345",
    database: process.env.DATABASE || "pedxopay",
    entities: [User, Account, Transactions],
    autoLoadEntities: true,
    logging: (process.env.TYPEORM_LOGGING ? [process.env.TYPEORM_LOGGING] : ["error"]) as LoggerOptions,
    migrations: [__dirname + "/../migrations/*{.ts,.js}"],
    synchronize: process.env.TYPEORM_SYNCHRONIZE !== "false",
    migrationsRun: process.env.TYPEORM_MIGRATIONS_RUN == "true",
    ssl: useSsl,
    cli: { migrationsDir: "src/migrations/" },
  },
  dSource: {
    type: (process.env.TYPEORM_CONNECTION || "mysql") as DatabaseType,
    host: process.env.DATABASE_HOST || "127.0.0.1",
    port: Number(process.env.DATABASE_PORT) || 3306,
    username: process.env.DATABASE_USERNAME || "root",
    password: process.env.DATABASE_PASSWORD || "root12345",
    database: process.env.DATABASE || "pedxopay",
    entities: [User, Account, Transactions],
    autoLoadEntities: true,
    logging: (process.env.TYPEORM_LOGGING ? [process.env.TYPEORM_LOGGING] : ["error"]) as LoggerOptions,
    migrations: [__dirname + "/../migrations/*{.ts,.js}"],
    synchronize: process.env.TYPEORM_SYNCHRONIZE !== "false",
    migrationsRun: process.env.TYPEORM_MIGRATIONS_RUN == "true",
    ssl: useSsl,
    cli: { migrationsDir: "src/migrations/" },
  },
};

export default config;
