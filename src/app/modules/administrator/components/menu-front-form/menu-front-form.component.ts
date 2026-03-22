import { Component, DestroyRef, inject, input, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolesService } from '@modules/administrator/services';
import { InputErrorComponent, JsonEditorComponent } from '@shared/components';
import { MAGIC_NUMBERS } from '@shared/constants';
import { INPUT_ERROR, JSON_EDITOR_HEIGHT_UNIT, JSON_EDITOR_MODE, JSON_EDITOR_TYPE } from '@shared/enums';
import { IInputErrorComponent, IJsonEditorComponent, IMenuFront, IRole, ITranslateLiterals } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { TranslateService } from '@shared/services';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'sctl-menu-front-form',
  standalone: true,
  templateUrl: './menu-front-form.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextModule,
    ToggleSwitchModule,
    InputNumberModule,
    MultiSelectModule,
    JsonEditorComponent,
    InputErrorComponent
  ]
})
export class MenuFrontFormComponent implements OnInit {

  public value = input<IMenuFront>();

  public valueChange = output<IMenuFront>();
  public formValid = output<boolean>();

  public menuFrontForm: FormGroup;
  public roleOptions: { name: string; _id: string }[] = [];
  public jsonEditorConfig: IJsonEditorComponent;
  public formErrors: { [key: string]: IInputErrorComponent } = {};

  private literals: ITranslateLiterals;
  private firstChange: boolean;

  private destroyRef$ = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private rolesService = inject(RolesService);

  ngOnInit(): void {
    this.firstChange = true;
    this.getRoles();
    this.initForm();
    this.fillForm(this.value());
    this.translateService.stream('MENU_FRONT')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.setJsonEditorConfig();
        this.setFormErrors();
      });
  }

  private getRoles(): void {
    this.rolesService.find(null)
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: IRole[]) => this.roleOptions = res?.map(role => ({ name: role.name, _id: role._id })) ?? []);
  }

  private initForm(): void {
    this.menuFrontForm = new FormGroup({
      label: new FormControl<string>(''),
      separator: new FormControl<boolean>(false),
      icon: new FormControl<string>(''),
      routerLink: new FormControl<string>(''),
      items: new FormControl<IMenuFront[]>([]),
      roles: new FormControl<IRole[]>([]),
      order: new FormControl<number>(MAGIC_NUMBERS.N_0, [Validators.required])
    });

    this.menuFrontForm.valueChanges.subscribe((value: IMenuFront) => {
      if (this.firstChange) {
        this.firstChange = false;
        return;
      }

      if (!this.menuFrontForm.valid) {
        return;
      }

      this.valueChange.emit(value);
    });

    this.menuFrontForm.statusChanges.subscribe((status: string) => {
      this.formValid.emit(status === 'VALID' ? true : false);
    });
  }

  private fillForm(value: IMenuFront): void {
    this.menuFrontForm.setValue({
      label: value?.label ?? '',
      separator: value?.separator ?? false,
      icon: value?.icon ?? '',
      routerLink: value?.routerLink ?? '',
      items: value?.items ?? [],
      roles: value?.roles ? value.roles.map(role => ({ name: role.name, _id: role._id })) : [],
      order: value?.order ?? MAGIC_NUMBERS.N_0
    });
  }

  private setJsonEditorConfig(): void {
    this.jsonEditorConfig = {
      height: MAGIC_NUMBERS.N_400,
      heightUnit: JSON_EDITOR_HEIGHT_UNIT.PIXELS,
      type: JSON_EDITOR_TYPE.ARRAY_OBJECT,
      mode: JSON_EDITOR_MODE.CODE,
      inputId: 'menu-front-form-items'
    };
  }

  private setFormErrors(): void {
    this.formErrors = {
      order: {
        formControl: this.menuFrontForm?.get?.('order'),
        cssClass: 'mb-0',
        errorsToShow: [
          { error: INPUT_ERROR.REQUIRED, message: this.literals?.['ERRORS']?.['ORDER'] }
        ]
      }
    }
  }
}
