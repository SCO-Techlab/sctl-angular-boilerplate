import { NgClass } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { environment } from '@environment';
import { IUser } from '@shared/interfaces';

@Component({
  selector: 'sctl-user-avatar',
  standalone: true,
  templateUrl: './user-avatar.component.html',
  imports: [
    NgClass
  ]
})
export class UserAvatarComponent {
  public user = input<IUser>(undefined);
  public cssClass = input<string>();
  public canClick = input<boolean>(false);

  public clickAvatar = output<Event>();

  public get css(): string {
    return this.cssClass() ?? 'w-[125px] h-[125px]';
  }


  public get userAvatar(): string {
    if (this.user()?._id && this.user()?.avatar) {
      return `${environment.apiUrl}/profile/get/user/avatar/${this.user()?._id}/${this.user()?.avatar}`;
    }

    return '../../../../../assets/images/user-avatar.png';
  }

  public onClickAvatar($event: Event): void {
    if (!this.canClick()) {
      return;
    }

    this.clickAvatar.emit($event);
  }
}
