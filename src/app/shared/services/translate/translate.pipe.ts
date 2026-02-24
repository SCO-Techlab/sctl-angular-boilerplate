import { ChangeDetectorRef, DestroyRef, Pipe, PipeTransform, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from './translate.service';

@Pipe({
  name: 'sctlTranslate',
  pure: false
})
export class TranslatePipe implements PipeTransform {
  private lastKey?: string;
  private lastParams?: Record<string, any>;
  private value?: string;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly translate: TranslateService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.translate.onLangChange$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.lastKey) {
          this.updateValue(this.lastKey, this.lastParams);
        }
      });
  }

  transform(key: string, params?: Record<string, any>): string {
    if (!key) return '';
    if (key === this.lastKey && JSON.stringify(params) === JSON.stringify(this.lastParams)) {
      return this.value!;
    }

    this.lastKey = key;
    this.lastParams = params;
    this.updateValue(key, params);
    return this.value!;
  }

  private updateValue(key: string, params?: Record<string, any>): void {
    this.value = this.translate.instant(key, params);
    this.cdr.markForCheck();
  }
}
