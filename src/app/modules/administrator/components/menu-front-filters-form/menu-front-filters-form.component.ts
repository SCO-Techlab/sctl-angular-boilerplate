import { Component, DestroyRef, inject, OnInit, output, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@core/shared/modules';
import { TranslateService } from '@core/shared/services';
import { IMenuFront } from '@shared/interfaces';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'sctl-menu-front-filters-form',
  standalone: true,
  templateUrl: './menu-front-filters-form.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextModule,
    SelectModule,
    InputNumberModule
  ]
})
export class MenuFrontFiltersFormComponent implements OnInit {

  public valueChange = output<Partial<IMenuFront>>();

  public form: FormGroup;
  public booleanOptions: { name: string; value: string }[] = [];

  private readonly destroyRef$ = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);

  ngOnInit(): void {
    this.initForm();
    this.getBooleanOptions();
  }

  public clearForm(): void {
    this.form.reset();
  }

  private initForm(): void {
    this.form = new FormGroup({
      label: new FormControl(null),
      separator: new FormControl(null),
      icon: new FormControl(null),
      routerLink: new FormControl(null),
      order: new FormControl(null)
    });

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(value => this.valueChange.emit(value));
  }

  private getBooleanOptions(): void {
    this.booleanOptions = [
      { name: this.translateService.instant('COMMON.NONE'), value: null },
      { name: this.translateService.instant('COMMON.YES'), value: 'true' },
      { name: this.translateService.instant('COMMON.NO'), value: 'false' }
    ];
  }

}
