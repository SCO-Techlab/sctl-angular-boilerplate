import { Component, inject, input } from '@angular/core';
import { LoaderComponent } from '@core/components';
import { MAGIC_NUMBERS } from '@core/shared/constants';
import { ISpinnerComponent } from '@core/shared/interfaces';
import { SpinnerService } from '@core/shared/services';

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

  public get isShowing(): boolean {
    return this.spinnerService.isShowing;
  }

  private readonly spinnerService = inject(SpinnerService);
}
