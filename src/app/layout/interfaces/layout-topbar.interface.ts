export interface ILayoutTopbarComponent {
  menuButtonCssClass?: string;
  menuButtonIconSize?: string;
  logoRedirect?: string;
  logoUrl?: string;
  logoText?: string;
  logoCssClass?: string;
  actions?: ILayoutTopbarAction[];
  switchThemeDarkModeLabel?: string;
  switchThemeLightModeLabel?: string;
}

export interface ILayoutTopbarAction {
  icon: string;
  label: string;
  command?: (event: any) => void;
}