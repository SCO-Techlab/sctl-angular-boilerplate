import { NgClass } from '@angular/common';
import { Component, effect, input, OnInit, output } from '@angular/core';
import { DialogComponent } from '@shared/components';
import { BUTTON_SEVERITY } from '@shared/enums';
import { IOrderListDialogComponent } from '@shared/interfaces';
import { OrderListModule } from 'primeng/orderlist';

@Component({
  selector: 'sctl-order-list-dialog',
  standalone: true,
  templateUrl: './order-list-dialog.component.html',
  styleUrls: ['./order-list-dialog.component.scss'],
  imports: [
    NgClass,
    DialogComponent,
    OrderListModule
  ]
})
export class OrderListDialogComponent implements OnInit {

  public visible = input<boolean>(false);
  public values = input<any[]>([]);
  public config = input<IOrderListDialogComponent>({
    dialogConfig: {
      closeOnSubmit: false,
      header: {
        closable: true,
        title: 'Order List Dialog',
        subTitle: 'Order List Dialog sub title'
      },
      footer: {
        cancelButton: {
          show: true,
          label: 'Close',
          severity: BUTTON_SEVERITY.SECONDARY,
          outlined: true,
          text: false,
          rounded: false,
          disabled: undefined
        },
        submitButton: {
          show: false,
          label: 'Save',
          severity: BUTTON_SEVERITY.PRIMARY,
          outlined: true,
          text: false,
          rounded: false,
          disabled: undefined
        }
      }
    },
    dataKey: '',
    titleKeys: [],
    notResponsive: false,
    readonly: false
  });

  public submit = output<void>();
  public close = output<void>();
  public reorder = output<void>();

  public showDialog: boolean = false;

  constructor() {
    effect(() => {
      this.visible;
      this.showDialog = this.visible();
    })
  }

  ngOnInit(): void {
    this.showDialog = this.visible();
  }

  public onClose(): void {
    this.showDialog = false;
    this.close.emit();
  }

  public onSubmit(closeOnSubmit: boolean): void {
    if (closeOnSubmit) {
      this.showDialog = false;
    }

    this.submit.emit();
  }

  public onReorder(): void {
    if (this.config()?.readonly === true) {
      return;
    }

    this.reorder.emit();
  }

  public getOptionLabel(option: any): string {
    if (!this.config()?.titleKeys?.length && !this.config()?.dataKey) {
      return option;
    }

    if (this.config()?.titleKeys?.length) {
      return this.config()?.titleKeys.map(key => option[key]).join(' - ');
    }

    return option[this.config()?.dataKey];
  }
}
