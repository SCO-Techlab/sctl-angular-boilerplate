import { NgClass } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { environment } from '@environment';
import { IUser } from '@shared/interfaces';
import { UserService } from '@shared/services';

@Component({
  selector: 'sctl-user-avatar',
  standalone: true,
  templateUrl: './user-avatar.component.html',
  imports: [
    NgClass
  ]
})
export class UserAvatarComponent {
  public cssClass = input<string>();
  public canClick = input<boolean>(false);

  public clickAvatar = output<Event>();

  public get css(): string {
    return this.cssClass() ?? 'w-[125px] h-[125px]';
  }

  public get user(): IUser {
    return this.userService.loggedUser();
  }

  public get userAvatar(): string {
    if (this.user?._id && this.user?.avatar) {
      return `${environment.apiUrl}/profile/get/user/avatar/${this.user?._id}/${this.user?.avatar}`;
    }

    return '../../../../../assets/images/user-avatar.png';
  }

  private userService = inject(UserService);

  public onClickAvatar($event: Event): void {
    if (!this.canClick()) {
      return;
    }

    this.clickAvatar.emit($event);
  }
}
