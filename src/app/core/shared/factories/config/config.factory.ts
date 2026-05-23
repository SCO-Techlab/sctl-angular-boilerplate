import { ConfigService } from "@core/shared/services";

export function ConfigInitializerFactory(configService: ConfigService) {
  return () => configService.readConfigJson('assets/config.json');
}
