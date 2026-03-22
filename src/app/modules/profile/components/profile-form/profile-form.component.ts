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
  
  public lockForm = input<boolean>(true);
  public showSaveButton = input<boolean>(true);
  public saveDisabled = input<boolean>(false);
  
  public save = output<void>();
  public lock = output<void>();

  public onClickSave(): void {
    this.save.emit();
  }

  public onClickLockOrUnlockForm(): void {
    this.lock.emit();
  }
}
