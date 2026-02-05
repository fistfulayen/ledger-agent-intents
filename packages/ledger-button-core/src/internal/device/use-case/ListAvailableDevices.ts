import { DiscoveredDevice } from "@ledgerhq/device-management-kit";
import { inject, injectable } from "inversify";

import { loggerModuleTypes } from "../../logger/loggerModuleTypes.js";
import type {
  LoggerPublisher,
  LoggerPublisherFactory,
} from "../../logger/service/LoggerPublisher.js";
import { deviceModuleTypes } from "../deviceModuleTypes.js";
import { type DeviceManagementKitService } from "../service/DeviceManagementKitService.js";

@injectable()
export class ListAvailableDevices {
  private readonly logger: LoggerPublisher;
  constructor(
    @inject(loggerModuleTypes.LoggerPublisher)
    loggerFactory: LoggerPublisherFactory,
    @inject(deviceModuleTypes.DeviceManagementKitService)
    private readonly deviceManagementKitService: DeviceManagementKitService,
  ) {
    this.logger = loggerFactory("[ListAvailableDevices UseCase]");
  }

  async execute(): Promise<DiscoveredDevice[]> {
    this.logger.info("Listing available devices");
    return this.deviceManagementKitService.listAvailableDevices();
  }
}
