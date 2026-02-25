import { TemplateRef } from '@angular/core';

export interface ILayoutTopbar {
  menuButtonCssClass?: string;
  menuButtonIconSize?: string;
  logoTemplate?: TemplateRef<any>;
  logoRedirect?: string;
  logoUrl?: string;
  logoText?: string;
  logoCssClass?: string;
  actionsTemplate?: TemplateRef<any>;
  actions?: ILayoutTopbarAction[];
  switchThemeDarkModeLabel?: string;
  switchThemeLightModeLabel?: string;
}

export interface ILayoutTopbarAction {
  icon: string;
  label: string;
  command?: (event: any) => void;
}