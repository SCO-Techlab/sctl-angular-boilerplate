import { TemplateRef } from '@angular/core';

export interface ILayoutFooter {
  footerTemplate?: TemplateRef<any>;
  footerText?: string;
  footerLink?: string;
  footerLinkText?: string;
}