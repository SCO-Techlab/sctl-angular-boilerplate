import { Component, DestroyRef, inject, OnInit, output, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@core/shared/modules';
import { IRoom } from '@shared/interfaces';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'sctl-rooms-filters-form',
  standalone: true,
  templateUrl: './rooms-filters-form.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextModule,
    InputNumberModule,
  ]
})
export class RoomsFiltersFormComponent implements OnInit {

  public valueChange = output<Partial<IRoom>>();

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
      beds: new FormControl<number | null>(null),
    });

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(value => this.valueChange.emit(value));
  }
}