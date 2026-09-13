import { Component, DestroyRef, inject, OnInit, output, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@core/shared/modules';
import { TranslateService } from '@core/shared/services';
import { UsersService } from '@modules/administrator/services';
import { ITenant, IUser } from '@shared/interfaces';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'sctl-tenants-filters-form',
  standalone: true,
  templateUrl: './tenants-filters-form.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextModule,
    SelectModule
  ]
})
export class TenantsFiltersFormComponent implements OnInit {

  public valueChange = output<Partial<ITenant>>();

  public form: FormGroup;
  public userOptions: { name: string; value: string }[] = [];

  private readonly destroyRef$ = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);
  private readonly usersService = inject(UsersService);

  ngOnInit(): void {
    this.initForm();
    this.getUserOptions();
  }

  public clearForm(): void {
    this.form.reset();
  }

  private initForm(): void {
    this.form = new FormGroup({
      name: new FormControl(null),
      owner: new FormControl(null)
    });

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(value => this.valueChange.emit(value));
  }

  private getUserOptions(): void {
    this.usersService.find(null)
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: IUser[]) => {
        const options = res?.map(user => ({ name: user.email, value: user._id })) ?? [];
        if (options?.length) {
          this.userOptions = [
            { name: this.translateService.instant('COMMON.NONE'), value: null },
            ...options
          ];
        }
      });
  }
}
