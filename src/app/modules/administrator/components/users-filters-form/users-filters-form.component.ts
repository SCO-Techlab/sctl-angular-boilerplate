import { Component, DestroyRef, inject, OnInit, output, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RolesService } from '@modules/administrator/services';
import { IRole, IUser } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
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

  private destroyRef$ = inject(DestroyRef);
  private rolesService = inject(RolesService);

  ngOnInit(): void {
    this.initForm();
    this.getRoles();
  }

  public clearForm(): void {
    this.form.reset();
  }

  private initForm(): void {
    this.form = new FormGroup({
      email: new FormControl(null),
      role: new FormControl(null)
    });

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(value => this.valueChange.emit(value));
  }

  private getRoles(): void {
    this.rolesService.find(null)
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: IRole[]) => this.rolesOptions = res?.map(role => ({ name: role.name, value: role._id })) ?? []);
  }
}
