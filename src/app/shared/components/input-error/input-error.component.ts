import { Component, input, OnInit } from '@angular/core';
import { IInputErrorComponent } from '@shared/interfaces';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'sctl-input-error',
  standalone: true,
  templateUrl: './input-error.component.html',
  imports: [
    MessageModule
  ]
})
export class InputErrorComponent implements OnInit {

  public config = input<IInputErrorComponent>({
    cssClass: 'mb-8',
    formControl: undefined,
    errorsToShow: []
  });

  ngOnInit(): void {
    this.setDefaultConfig();
  }

  public showInputError(): boolean {
    return this.config()?.formControl !== undefined &&
      (this.config()?.formControl.invalid && (this.config()?.formControl.dirty || this.config()?.formControl.touched));
  }

  private setDefaultConfig(): void {
    if (!this.config()) {
      return;
    }
    
    this.config().cssClass = this.config()?.cssClass ?? 'mb-8';
    this.config().formControl = this.config()?.formControl ?? undefined;
    this.config().errorsToShow = this.config()?.errorsToShow ?? [];
  }
}
