import { ConfigService } from '../services/config/config.service';

export function ConfigInitializerFactory(configService: ConfigService) {
  return () => configService.readConfigJson('assets/config.json');
}
