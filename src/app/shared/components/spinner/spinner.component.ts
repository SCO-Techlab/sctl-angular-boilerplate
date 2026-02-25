import { Component, Input } from '@angular/core';
import { LoaderComponent } from '../loader';
import { SpinnerService } from '../../services/spinner';
import { ISpinnerComponent } from '../../interfaces';

@Component({
  selector: 'sctl-spinner',
  standalone: true,
  styleUrls: ['./spinner.component.scss'],
  templateUrl: './spinner.component.html',
  imports: [LoaderComponent]
})

export class SpinnerComponent {
  @Input() config: ISpinnerComponent = {
    pathImg: "../../resources/images/spinner.gif",
    loaderMode: false,
    loaderConfig: {
      showLoader: true,
      width: 72,
      height: 72,
      borderWidth: 10
    }
  };

  constructor(public readonly spinnerService: SpinnerService) { }
}
