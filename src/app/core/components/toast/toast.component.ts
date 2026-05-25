import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, inject, input, OnDestroy, OnInit } from '@angular/core';
import { TOAST_POSITION } from '@core/shared/enums';
import { IToastComponent, IToastMessage } from '@core/shared/interfaces';
import { ToastService } from '@core/shared/services';
import { LayoutService } from '@layout/services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'sctl-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  animations: [
    trigger('toastAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' })),
      ]),
    ]),
  ],
  imports: [
    CommonModule
  ]
})
export class ToastComponent implements OnInit, OnDestroy {

  public darkTheme = input<boolean>(false);
  public config = input<IToastComponent>({});

  public readonly TOAST_POSITION = TOAST_POSITION;
  public messages: IToastMessage[] = [];
  public sub!: Subscription;

  private readonly layoutService = inject(LayoutService);
  private readonly toastService = inject(ToastService);

  ngOnInit(): void {
    this.sub = this.toastService.messages$.subscribe(msgs => (this.messages = msgs));
    this.toastService.toastLimit = this.config()?.toastLimit ?? undefined;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  close(id: string): void {
    this.toastService.remove(id);
  }

  getIcon(severity?: string): string {
    switch (severity) {
      case 'success':
        return 'pi pi-check-circle';
      case 'info':
        return 'pi pi-info-circle';
      case 'warn':
        return 'pi pi-exclamation-triangle';
      case 'error':
        return 'pi pi-times-circle';
      default:
        return 'pi pi-comment';
    }
  }

  getPosition(): string {
    if (!this.config()?.position) {
      return TOAST_POSITION.TOP_RIGHT;
    }

    return Object.values(TOAST_POSITION).includes(this.config()?.position)
      ? this.config()?.position
      : TOAST_POSITION.TOP_RIGHT;
  }
}
