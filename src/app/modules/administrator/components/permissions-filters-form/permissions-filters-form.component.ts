import { Component, DestroyRef, inject, OnInit, output, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@core/shared/modules';
import { TranslateService } from '@core/shared/services';
import { PERMISSION_TYPE } from '@shared/enums';
import { IPermission } from '@shared/interfaces';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'sctl-permissions-filters-form',
  standalone: true,
  templateUrl: './permissions-filters-form.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextModule,
    SelectModule
  ]
})
export class PermissionsFiltersFormComponent implements OnInit {

  public valueChange = output<Partial<IPermission>>();

  public form: FormGroup;
  public typeOptions: { name: string; type: string }[] = [];

  private destroyRef$ = inject(DestroyRef);
  private translateService = inject(TranslateService);

  ngOnInit(): void {
    this.initForm();
    this.getTypeOptions();
  }

  public clearForm(): void {
    this.form.reset();
  }

  private initForm(): void {
    this.form = new FormGroup({
      name: new FormControl(null),
      type: new FormControl(null)
    });

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(value => this.valueChange.emit(value));
  }

  private getTypeOptions(): void {
    const types: string[] = Object.values(PERMISSION_TYPE);
    const options = types.map(type => ({ name: type, type: type }));
    this.typeOptions = [
      { name: this.translateService.instant('COMMON.NONE'), type: null },
      ...options
    ];
  }
}
