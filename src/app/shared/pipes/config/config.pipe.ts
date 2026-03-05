import { inject, Pipe, PipeTransform } from '@angular/core';
import { ConfigService } from '@shared/services';

@Pipe({
  name: 'config',
  standalone: true
})
export class ConfigPipe implements PipeTransform {

  private configService = inject(ConfigService);

  transform(path: string): any {
    return this.configService.get(path);
  }
}