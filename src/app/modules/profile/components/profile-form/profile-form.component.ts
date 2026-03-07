import { Component, input, output } from '@angular/core';
import { TranslateModule } from '@shared/modules';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'sctl-profile-form',
  standalone: true,
  templateUrl: './profile-form.component.html',
  imports: [
    TranslateModule,
    ButtonModule
  ]
})
export class ProfileFormComponent {
  public saveDisabled = input<boolean>(false);
  
  public save = output<void>();
  public lock = output<boolean>();

  public lockForm: boolean = true;

  public onClickSave(): void {
    this.save.emit();
  }

  public onClickLockOrUnlockForm(): void {
    this.lockForm = !this.lockForm;
    this.lock.emit(this.lockForm);
  }
}
