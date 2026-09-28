import { Component, DestroyRef, inject, OnInit, output, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@core/shared/modules';
import { ICustomer } from '@shared/interfaces';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'sctl-customers-filters-form',
  standalone: true,
  templateUrl: './customers-filters-form.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextModule,
  ]
})
export class CustomersFiltersFormComponent implements OnInit {

  public valueChange = output<Partial<ICustomer>>();

  public form: FormGroup;

  private readonly destroyRef$ = inject(DestroyRef);

  ngOnInit(): void {
    this.initForm();
  }

  public clearForm(): void {
    this.form.reset();
  }

  private initForm(): void {
    this.form = new FormGroup({
      name: new FormControl<string>(''),
      email: new FormControl<string>(''),
      phone: new FormControl<string>(''),
      dni: new FormControl<string>(''),
    });

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(value => this.valueChange.emit(value));
  }
}
