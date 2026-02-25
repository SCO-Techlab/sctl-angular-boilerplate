import { ConfigService } from '../services';

export function ConfigInitializerFactory(configService: ConfigService) {
  return () => configService.readConfigJson('assets/config.json');
}
