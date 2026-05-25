export interface INotfoundComponent {
  title?: string;
  message?: string;
  buttonLabel?: string;
  buttonLink?: string;
  actions?: INotfoundComponentAction[];
}

export interface INotfoundComponentAction {
  icon: string;
  title: string;
  subTitle?: string;
  link?: string;
}