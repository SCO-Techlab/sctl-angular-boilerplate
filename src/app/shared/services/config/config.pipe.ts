import { Pipe, PipeTransform } from '@angular/core';
import { ConfigService } from '..';

@Pipe({
  name: 'sctlConfig',
  standalone: true
})
export class ConfigPipe implements PipeTransform {

  constructor(private readonly service: ConfigService) { }

  transform(path: string): any {
    return this.service.get(path);
  }
}
