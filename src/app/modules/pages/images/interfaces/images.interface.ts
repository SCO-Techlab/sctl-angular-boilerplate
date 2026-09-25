import { IResidence, IRoom } from "@shared/interfaces";

export interface ITenantImages {
  residences?: IResidence[];
  rooms?: IRoom[];
}

export interface IImageItem {
  item: any;
  src: string;
  formatSrc: string;
  type: string;
  name: string;
  viewDisabled: boolean;
}