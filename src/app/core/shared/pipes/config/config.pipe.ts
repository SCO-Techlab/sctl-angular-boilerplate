import { inject, Pipe, PipeTransform } from '@angular/core';
import { ConfigService } from '@core/shared/services';

@Pipe({
  name: 'config',
  standalone: true
})
export class ConfigPipe implements PipeTransform {

  private readonly configService = inject(ConfigService);

  public transform(path: string): any {
    return this.configService.get(path);
  }
}