import { IAuthCardComponent } from "../interfaces"

export const setAuthCardConfig = (title: string, subTitle: string): IAuthCardComponent => {
  return {
    headerConfig: {
      showLogo: true,
      logoUrl: '/assets/images/logo.png',
      logoText: '',
      logoRedirect: '',
      logoCssClass: 'w-32',
      title,
      subTitle
    }
  }
}