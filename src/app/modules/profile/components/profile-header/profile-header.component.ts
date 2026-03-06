import { NgClass, NgStyle, TitleCasePipe } from '@angular/common';
import { Component, DestroyRef, inject, input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CardComponent } from '@shared/components';
import { ICardComponent, ITranslateLiterals, IUser } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { ScreenService, TranslateService } from '@shared/services';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'sctl-profile-header',
  standalone: true,
  templateUrl: './profile-header.component.html',
  imports: [
    NgClass,
    NgStyle,
    TitleCasePipe,
    TranslateModule,
    MessageModule,
    CardComponent
  ]
})
export class ProfileHeaderComponent implements OnInit {
  public user = input<IUser>();
  public avatarUrl = input<string>('../../../../../assets/images/user-avatar.png');

  public cardConfig: ICardComponent = {
    title: '',
    contrast: true,
    noPadding: true
  };
  public literals: ITranslateLiterals;

  public get headerUsername(): string {
    return this.user()?.personalName ?? this.user()?.userName ?? 'Usuario';
  }

  public get userStatusColor(): string {
    return this.user()?.active ? 'var(--p-message-success-color)' : 'var(--p-message-error-color)';
  }

  public screenService = inject(ScreenService);
  private destroyRef$ = inject(DestroyRef);
  private translateService = inject(TranslateService);

  ngOnInit(): void {
    this.translateService.stream('PROFILE.HEADER')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => this.literals = res);
  }
}
