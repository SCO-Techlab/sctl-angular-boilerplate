import { Component, DestroyRef, inject, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IUser } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'sctl-users-filters-form',
  standalone: true,
  templateUrl: './users-filters-form.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextModule,
  ]
})
export class UsersFiltersFormComponent implements OnInit {

  public valueChange = output<Partial<IUser>>();

  public form: FormGroup;

  private destroyRefs$ = inject(DestroyRef);

  ngOnInit(): void {
    this.form = new FormGroup({
      email: new FormControl(null),
    });

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRefs$))
      .subscribe(value => this.valueChange.emit(value));
  }

  public clearForm(): void {
    this.form.reset();
  }
}
