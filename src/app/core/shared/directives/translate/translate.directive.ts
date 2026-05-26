import { DestroyRef, Directive, ElementRef, Input, OnInit, Renderer2, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@core/shared/services';

@Directive({
  selector: '[translate]',
  standalone: true
})
export class TranslateDirective implements OnInit {

  @Input('translate') key!: string;
  @Input('translateParams') params?: Record<string, any>;

  private readonly destroyRef = inject(DestroyRef);
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly translate = inject(TranslateService);

  ngOnInit(): void {
    this.updateText();

    this.translate.onLangChange$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateText());
  }

  private updateText(): void {
    if (!this.key) {
      return;
    }

    const text = this.translate.instant(this.key, this.params);
    this.renderer.setProperty(this.el.nativeElement, 'textContent', text);
  }
}
