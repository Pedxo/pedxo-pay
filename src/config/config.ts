import { DatabaseType, LoggerOptions } from "typeorm";
import { config as dotenvConfig } from "dotenv";
dotenvConfig({ path: ".env" });

const config = {
  app: {
    env: process.env.APP_ENV || "development",
    accNumPoolStart: process.env.ACC_NUM_POOL_START || "9000000000",
    accNumSavingStart: process.env.ACC_NUM_SAVING_START || "1000000000",
  },
  typeOrm: {
    type: process.env.TYPEORM_CONNECTION || ("mysql" as DatabaseType),
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT || 3306,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
    entities: (process.env.TYPEORM_ENTITIES as string).split("|"),
    autoLoadEntities: process.env.TYPEORM_AUTO_LOAD_ENTITIES == "true",
    logging: (process.env.TYPEORM_LOGGING as string).split(
      "|"
    ) as LoggerOptions,
    migrations: (process.env.TYPEORM_MIGRATIONS as string).split("|"),
    synchronize: process.env.TYPEORM_SYNCHRONIZE == "true",
    migrationsRun: process.env.TYPEORM_MIGRATIONS_RUN == "true",
    cli: { migrationsDir: process.env.TYPEORM_MIGRATIONS_DIR },
  },
  dSource: {
    type: process.env.TYPEORM_CONNECTION || ("mysql" as DatabaseType),
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT || 3306,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
    entities: (process.env.DATA_S_TYPEORM_ENTITIES as string).split("|"),
    autoLoadEntities: process.env.TYPEORM_AUTO_LOAD_ENTITIES == "true",
    logging: (process.env.TYPEORM_LOGGING as string).split(
      "|"
    ) as LoggerOptions,
    migrations: (process.env.DATA_S_TYPEORM_MIG as string).split("|"),
    synchronize: process.env.TYPEORM_SYNCHRONIZE == "true",
    migrationsRun: process.env.TYPEORM_MIGRATIONS_RUN == "true",
    cli: { migrationsDir: process.env.TYPEORM_MIGRATIONS_DIR },
  },
};

export default config;
