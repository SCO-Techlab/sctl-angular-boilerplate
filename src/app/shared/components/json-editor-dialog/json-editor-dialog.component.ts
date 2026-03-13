import { Component, effect, input, OnInit, output } from '@angular/core';
import { DialogComponent, JsonEditorComponent } from '@shared/components';
import { MAGIC_NUMBERS } from '@shared/constants';
import { BUTTON_SEVERITY, JSON_EDITOR_HEIGHT_UNIT, JSON_EDITOR_MODE, JSON_EDITOR_TYPE } from '@shared/enums';
import { IJsonEditorDialogComponent } from '@shared/interfaces';

@Component({
  selector: 'sctl-json-editor-dialog',
  standalone: true,
  templateUrl: './json-editor-dialog.component.html',
  imports: [
    DialogComponent,
    JsonEditorComponent
  ]
})
export class JsonEditorDialogComponent implements OnInit {

  public visible = input<boolean>(false);
  public value = input<any>({});
  public config = input<IJsonEditorDialogComponent>({
    dialogConfig: {
      closeOnSubmit: false,
      header: {
        closable: true,
        title: 'Json Editor Dialog',
        subTitle: 'Json Editor Dialog sub title'
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
          show: true,
          label: 'Save',
          severity: BUTTON_SEVERITY.PRIMARY,
          outlined: true,
          text: false,
          rounded: false,
          disabled: undefined
        }
      }
    },
    jsonConfig: {
      height: MAGIC_NUMBERS.N_400,
      heightUnit: JSON_EDITOR_HEIGHT_UNIT.PIXELS,
      type: JSON_EDITOR_TYPE.OBJECT,
      mode: JSON_EDITOR_MODE.CODE,
      inputId: ''
    }
  });

  public submit = output<void>();
  public close = output<void>();
  public valueChange = output<any>();

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

  public onChange(value: any): void {
    this.valueChange.emit(value);
  }
}
