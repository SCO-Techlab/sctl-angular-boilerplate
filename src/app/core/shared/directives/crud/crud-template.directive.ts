import { Directive, inject, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[crudTemplate]',
  standalone: true
})
export class CrudTemplateDirective {
  @Input('crudTemplate') name!: string;

  public readonly template = inject(TemplateRef<any>);
}