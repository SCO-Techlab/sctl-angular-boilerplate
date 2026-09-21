import { Component, DestroyRef, inject, OnInit, output, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@core/shared/modules';
import { InputTextModule } from 'primeng/inputtext';
import { IResidence } from '../../interfaces';

@Component({
  selector: 'sctl-residences-filters-form',
  standalone: true,
  templateUrl: './residences-filters-form.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextModule,
  ]
})
export class ResidencesFiltersFormComponent implements OnInit {

  public valueChange = output<Partial<IResidence>>();

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
      street: new FormControl<string>(''),
      number: new FormControl<string>(''),
      door: new FormControl<string>(''),
      cadastre: new FormControl<string>(''),
      description: new FormControl<string>(''),
    });

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(value => this.valueChange.emit(value));
  }
}
