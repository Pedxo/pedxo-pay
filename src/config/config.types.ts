import { TypeOrmModule } from "@nestjs/typeorm";
import { AppConfig } from "./app.config";
import * as Joi from "joi";

export interface ConfigType {
  app: AppConfig;
  typeorm: TypeOrmModule;
}

export const appConfigSchema = Joi.object({
  APP_ENV: Joi.string()
    .valid("production", "stagin", "development")
    .default("development"),

  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(3306),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE: Joi.string().required(),
  TYPEORM_CONNECTION: Joi.string(),
  TYPEORM_LOGGING: Joi.string().default("error"),
  TYPEORM_SYNCHRONIZE: Joi.boolean().default(true),
  TYPEORM_MIGRATIONS_RUN: Joi.boolean().default(false),
  TYPEORM_AUTO_LOAD_ENTITIES: Joi.boolean().default(true),
  TYPEORM_MIGRATIONS: Joi.string(),
  TYPEORM_MIGRATIONS_DIR: Joi.string(),
});
