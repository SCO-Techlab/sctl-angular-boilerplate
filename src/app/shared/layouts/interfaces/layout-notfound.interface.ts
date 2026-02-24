export interface ILayoutNotfound {
  showConfigurator?: boolean;
  title?: string;
  message?: string;
  buttonLabel?: string;
  buttonLink?: string;
  actions?: ILayoutNotfoundAction[];
}

export interface ILayoutNotfoundAction {
  icon: string;
  title: string;
  subTitle?: string;
  link?: string;
}