import dotenv from "dotenv";
dotenv.config();
import { TopLevelConfig, Vals } from "./types/config";

const getConfig = (config: Vals): TopLevelConfig => ({
  MONGODB_URL: config.MONGODB_URL || process.env.MONGODB_URL as string,
  _VALS: {
    PORT: parseInt(process.env.PORT || "3000", 10)
  }
});

async function initConfig(config: Vals = {} as Vals): Promise<TopLevelConfig> {
  const initConf = await getConfig(config);
  return initConf;
}

export default initConfig;
