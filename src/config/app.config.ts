import { registerAs } from "@nestjs/config";

import config from "./config";

export interface AppConfig {
  env: string;
  accNumPoolStart: string;
  accNumSavingStart: string;
}
export const appConfig = registerAs("app", (): AppConfig => config.app);
