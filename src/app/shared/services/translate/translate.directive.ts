import { DestroyRef, Directive, ElementRef, Input, OnInit, Renderer2, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from './translate.service';

@Directive({
  selector: '[sctlTranslate]',
  standalone: true
})
export class TranslateDirective implements OnInit {

  @Input('sctlTranslate') key!: string;
  @Input('translateParams') params?: Record<string, any>;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly el: ElementRef,
    private readonly renderer: Renderer2,
    private readonly translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.updateText();

    this.translate.onLangChange$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateText());
  }

  private updateText(): void {
    if (!this.key) return;
    const text = this.translate.instant(this.key, this.params);
    this.renderer.setProperty(this.el.nativeElement, 'textContent', text);
  }
}
