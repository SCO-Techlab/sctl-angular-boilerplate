export interface ITranslateConfig {
  defaultLang: string;
  availableLangs: string[];
  path: string;
}

export interface ITranslateLiterals {
  [key: string]: any;
}