import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'join',
  pure: true
})
export class JoinPipe implements PipeTransform {

  transform(value: string[] | null | undefined, separator: string = ','): string {
    if (!value || !Array.isArray(value)) {
      return '';
    }

    return value.join(separator);
  }
}
