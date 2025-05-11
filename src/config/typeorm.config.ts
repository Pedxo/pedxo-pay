import { registerAs } from "@nestjs/config";
import config from "./config";
import { DataSource, DataSourceOptions } from "typeorm";

export const typeormConfig = registerAs("typeorm", () => config.typeOrm);
export const dataSource = new DataSource(config.dSource as DataSourceOptions);
