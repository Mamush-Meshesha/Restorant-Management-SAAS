export interface TopLevelConfig {
  MONGODB_URL: string;
  _VALS: Vals;
}

export interface Vals {
  MONGODB_URL?: string;
  PORT: string;
}
