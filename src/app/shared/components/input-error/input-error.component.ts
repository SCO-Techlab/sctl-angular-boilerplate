import { Component, Input, OnInit } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { IInputErrorComponent } from '../../interfaces/input-error.interface';

@Component({
  selector: 'sctl-input-error',
  standalone: true,
  templateUrl: './input-error.component.html',
  imports: [MessageModule]
})
export class InputErrorComponent implements OnInit {

  @Input() config: IInputErrorComponent = {};

  ngOnInit(): void {
    this.setDefaultConfig();
  }

  showInputError(): boolean {
    return this.config?.formControl !== undefined && 
      (this.config?.formControl.invalid && (this.config?.formControl.dirty || this.config?.formControl.touched));
  }

  private setDefaultConfig(): void {
    this.config = this.config ?? {};
    this.config.cssClass = this.config?.cssClass ?? 'mb-8';
    this.config.formControl = this.config?.formControl ?? undefined;
    this.config.errorsToShow = this.config?.errorsToShow ?? [];
  }
}
