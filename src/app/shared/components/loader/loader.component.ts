import { NgStyle } from '@angular/common';
import { ChangeDetectorRef, Component, inject, input } from '@angular/core';
import { MAGIC_NUMBERS } from '@shared/constants';
import { ILoaderComponent } from '@shared/interfaces';

@Component({
  selector: 'sctl-loader',
  standalone: true,
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  imports: [
    NgStyle
  ]
})
export class LoaderComponent {

  public config = input<ILoaderComponent>({
    showLoader: false,
    width: MAGIC_NUMBERS.N_36,
    height: MAGIC_NUMBERS.N_36,
    borderWidth: MAGIC_NUMBERS.N_5
  });

  private cdRef = inject(ChangeDetectorRef);

  public show(): void {
    this.config().showLoader = true;
    this.cdRef.detectChanges();
  }

  public hide(): void {
    this.config().showLoader = false;
    this.cdRef.detectChanges();
  }
}
