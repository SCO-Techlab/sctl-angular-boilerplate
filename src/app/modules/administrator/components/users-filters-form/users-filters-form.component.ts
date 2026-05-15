import { Component, DestroyRef, inject, OnInit, output, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RolesService } from '@modules/administrator/services';
import { IRole, IUser } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { TranslateService } from '@shared/services';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'sctl-users-filters-form',
  standalone: true,
  templateUrl: './users-filters-form.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextModule,
    SelectModule
  ]
})
export class UsersFiltersFormComponent implements OnInit {

  public valueChange = output<Partial<IUser>>();

  public form: FormGroup;
  public rolesOptions: { name: string; value: string }[] = [];
  public booleanOptions: { name: string; value: string }[] = [];

  private destroyRef$ = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private rolesService = inject(RolesService);

  ngOnInit(): void {
    this.initForm();
    this.getRoles();
    this.getBooleanOptions();
  }

  public clearForm(): void {
    this.form.reset();
  }

  private initForm(): void {
    this.form = new FormGroup({
      email: new FormControl(null),
      role: new FormControl(null),
      active: new FormControl(null),
      userName: new FormControl(null),
      personalName: new FormControl(null),
      emailConfirmed: new FormControl(null)
    });

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(value => this.valueChange.emit(value));
  }

  private getRoles(): void {
    this.rolesService.find(null)
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: IRole[]) => {
        const options = res?.map(role => ({ name: role.name, value: role._id })) ?? [];
        if (options?.length) {
          this.rolesOptions = [
            { name: this.translateService.instant('COMMON.NONE'), value: null },
            ...options
          ];
        }
      });
  }

  private getBooleanOptions(): void {
    this.booleanOptions = [
      { name: this.translateService.instant('COMMON.NONE'), value: null },
      { name: this.translateService.instant('COMMON.YES'), value: 'true' },
      { name: this.translateService.instant('COMMON.NO'), value: 'false' }
    ];
  }

}
