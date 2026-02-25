import { TemplateRef } from '@angular/core';

export interface ILayoutFooterComponent {
  footerTemplate?: TemplateRef<any>;
  footerText?: string;
  footerLink?: string;
  footerLinkText?: string;
}