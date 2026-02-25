import { NgStyle } from '@angular/common';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { MAGIC_NUMBERS } from '../../constants';
import { ILoaderComponent } from '../../interfaces';

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
  @Input() config: ILoaderComponent = {
    showLoader: false,
    width: MAGIC_NUMBERS.N_36,
    height: MAGIC_NUMBERS.N_36,
    borderWidth: MAGIC_NUMBERS.N_5
  };

  constructor(private cdRef: ChangeDetectorRef) { }

  public show(): void {
    this.config.showLoader = true;
    this.cdRef.detectChanges();
  }

  public hide(): void {
    this.config.showLoader = false;
    this.cdRef.detectChanges();
  }
}
