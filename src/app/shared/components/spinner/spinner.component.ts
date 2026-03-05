import { Component, inject, input } from '@angular/core';
import { MAGIC_NUMBERS } from '@shared/constants';
import { ISpinnerComponent } from '@shared/interfaces';
import { SpinnerService } from '@shared/services';
import { LoaderComponent } from '../loader';

@Component({
  selector: 'sctl-spinner',
  standalone: true,
  styleUrls: ['./spinner.component.scss'],
  templateUrl: './spinner.component.html',
  imports: [
    LoaderComponent
  ]
})

export class SpinnerComponent {

  public config = input<ISpinnerComponent>({
    pathImg: '',
    loaderMode: true,
    loaderConfig: {
      showLoader: true,
      width: MAGIC_NUMBERS.N_72,
      height: MAGIC_NUMBERS.N_72,
      borderWidth: MAGIC_NUMBERS.N_10
    }
  });

  private spinnerService = inject(SpinnerService);

  public get isShowing(): boolean {
    return this.spinnerService.isShowing;
  }
}
