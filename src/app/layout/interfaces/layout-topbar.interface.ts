import { TemplateRef } from '@angular/core';

export interface ILayoutTopbarComponent {
  menuButtonCssClass?: string;
  menuButtonIconSize?: string;
  logoTemplate?: TemplateRef<any>;
  logoRedirect?: string;
  logoUrl?: string;
  logoText?: string;
  logoCssClass?: string;
  actionsTemplate?: TemplateRef<any>;
  actions?: ILayoutTopbarComponentAction[];
  switchThemeDarkModeLabel?: string;
  switchThemeLightModeLabel?: string;
}

export interface ILayoutTopbarComponentAction {
  icon: string;
  label: string;
  command?: (event: any) => void;
}