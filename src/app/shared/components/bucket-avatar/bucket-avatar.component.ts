import { NgClass } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'sctl-bucket-avatar',
  standalone: true,
  templateUrl: './bucket-avatar.component.html',
  imports: [
    NgClass
  ]
})
export class BucketAvatarComponent {
  public src = input<string>(undefined);
  public errorSrc = input<string>(undefined);
  public cssClass = input<string>();
  public rounded = input<boolean>(true);
  public canClick = input<boolean>(false);

  public clickAvatar = output<Event>();

  public get css(): string {
    return this.cssClass() ?? 'w-[125px] h-[125px]';
  }

  public get roundedCss(): string {
    return this.rounded() ? 'rounded-full' : '';
  }

  public onClickAvatar($event: Event): void {
    if (!this.canClick()) {
      return;
    }

    this.clickAvatar.emit($event);
  }

  public onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;

    if (this.errorSrc() && !img.src.endsWith(this.errorSrc())) {
      img.src = this.errorSrc();
    }
  }
}
