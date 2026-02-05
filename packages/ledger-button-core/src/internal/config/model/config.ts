import { injectable } from "inversify";

import {
  LOG_LEVELS,
  type LogLevel,
  LogLevelKey,
} from "../../logger/model/constant.js";

export type Environment = "staging" | "production";

export type LKRPConfig = {
  cloudSyncUrl: string;
};

// TODO: Remove optional and default values
// Also remove ethereum key when ready
export type ConfigArgs = {
  originToken: string;
  logLevel?: LogLevelKey;
  dAppIdentifier: string;
  environment?: Environment;
  rpcUrls?: Record<string, string | undefined>;
};

@injectable()
export class Config {
  originToken: string;
  dAppIdentifier: string;
  logLevel: LogLevel;
  environment: Environment;
  lkrp: LKRPConfig;
  rpcUrls: Record<string, string | undefined>;

  constructor({
    originToken,
    dAppIdentifier,
    logLevel = "info",
    environment = "production",
    rpcUrls = {},
  }: ConfigArgs) {
    this.originToken = originToken;
    this.dAppIdentifier = dAppIdentifier;
    this.logLevel = LOG_LEVELS[logLevel];
    this.environment = environment;
    this.rpcUrls = rpcUrls;
    this.lkrp = {
      cloudSyncUrl: this.getCloudSyncUrl(),
    };
  }

  private getCloudSyncUrl(): string {
    return this.environment === "production"
      ? "https://cloud-sync-backend.api.aws.prd.ldg-tech.com"
      : "https://cloud-sync-backend.api.aws.stg.ldg-tech.com";
  }

  setLogLevel(logLevel: LogLevelKey) {
    this.logLevel = LOG_LEVELS[logLevel];
  }

  getAlpacaUrl(): string {
    return "https://alpaca.api.ledger.com";
  }

  getCalUrl(): string {
    return this.environment === "production"
      ? "https://crypto-assets-service.api.ledger.com"
      : "https://crypto-assets-service.api.ledger-test.com";
  }

  getBackendUrl(): string {
    return this.environment === "production"
      ? "https://ledgerb.aws.prd.ldg-tech.com"
      : "https://ledgerb.aws.stg.ldg-tech.com";
  }

  getRpcUrl(chainId: string | number): string | undefined {
    const key = String(chainId);
    const url = this.rpcUrls[key];
    return url || undefined;
  }

  getCounterValueUrl(): string {
    return "https://countervalues.live.ledger.com";
  }

  getExplorerUrl(): string {
    return "https://explorers.api.live.ledger.com";
  }

  setEnvironment(environment: Environment) {
    this.environment = environment;
    this.lkrp = {
      cloudSyncUrl: this.getCloudSyncUrl(),
    };
  }
}
