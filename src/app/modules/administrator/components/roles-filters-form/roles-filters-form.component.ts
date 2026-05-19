import { Component, DestroyRef, inject, OnInit, output, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IRole } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'sctl-roles-filters-form',
  standalone: true,
  templateUrl: './roles-filters-form.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextModule
  ]
})
export class RolesFiltersFormComponent implements OnInit {

  public valueChange = output<Partial<IRole>>();

  public form: FormGroup;

  private destroyRef$ = inject(DestroyRef);

  ngOnInit(): void {
    this.initForm();
  }

  public clearForm(): void {
    this.form.reset();
  }

  private initForm(): void {
    this.form = new FormGroup({
      name: new FormControl(null)
    });

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(value => this.valueChange.emit(value));
  }
}
