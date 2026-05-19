import { Component, DestroyRef, inject, OnInit, output, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ISession } from '@modules/administrator/interfaces';
import { UsersService } from '@modules/administrator/services';
import { IUser } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { TranslateService } from '@shared/services';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'sctl-sessions-filters-form',
  standalone: true,
  templateUrl: './sessions-filters-form.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextModule,
    SelectModule
  ]
})
export class SessionsFiltersFormComponent implements OnInit {
  public valueChange = output<Partial<ISession>>();

  public form: FormGroup;
  public userOptions: { name: string; value: string }[] = [];
  public booleanOptions: { name: string; value: string }[] = [];

  private destroyRef$ = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private usersService = inject(UsersService);

  ngOnInit(): void {
    this.initForm();
    this.setUserOptions();
    this.setBooleanOptions();
  }

  public clearForm(): void {
    this.form.reset();
  }

  private initForm(): void {
    this.form = new FormGroup({
      user: new FormControl(null),
      accessJti: new FormControl(null),
      refreshJti: new FormControl(null),
      isRevoked: new FormControl(null),
      isAccessRevoked: new FormControl(null),
      isRefreshRevoked: new FormControl(null)
    });

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(value => this.valueChange.emit(value));
  }

  private setUserOptions(): void {
    this.usersService.find(null)
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((users: IUser[]) => {
        this.userOptions = [
          { name: this.translateService.instant('COMMON.NONE'), value: null },
          ...users.map(user => ({ name: user.email, value: user._id }))
        ];
      });
  }

  private setBooleanOptions(): void {
    this.booleanOptions = [
      { name: this.translateService.instant('COMMON.NONE'), value: null },
      { name: this.translateService.instant('COMMON.YES'), value: 'true' },
      { name: this.translateService.instant('COMMON.NO'), value: 'false' }
    ];
  }
}
