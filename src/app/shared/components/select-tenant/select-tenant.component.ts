import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SessionStorageState } from '@core/session-storage';
import { Store } from '@ngxs/store';
import { ITenant } from '@shared/interfaces';
import { SelectTenantService, UserService } from '@shared/services';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { SelectModule } from 'primeng/select';


@Component({
  selector: 'sctl-select-tenant',
  standalone: true,
  templateUrl: './select-tenant.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SelectModule,
    InputGroupModule,
    InputGroupAddonModule
  ]
})
export class SelectTenantComponent implements OnInit {

  public form: FormGroup;
  public tenantsOptions: { name: string; value: string }[] = [];

  private destroyRef$ = inject(DestroyRef);
  private readonly store = inject(Store);
  private readonly selectTenantService = inject(SelectTenantService);
  private readonly userService = inject(UserService);

  ngOnInit() {
    this.tenantsOptions = this.formatTenantsOptions(this.userService.userTenants());
    this.listenToTokenChange();
    this.initForm();
    this.fillForm(this.userService.userTenants());
  }

  public onChangeValue($event: any): void {
    const value = $event?.value;
    this.selectTenantService.selectedTenant = value;
    this.selectTenantService.onTenantChange.next(value);
  }

  private initForm(): void {
    this.form = new FormGroup({
      tenant: new FormControl<string>(this.selectTenantService.selectedTenant ?? '')
    });
  }

  private fillForm(tenants: ITenant[]): void {
    this.form.setValue({
      tenant: tenants?.find(tenant => tenant._id === this.selectTenantService.selectedTenant)?._id ?? ''
    });
  }

  private formatTenantsOptions(tenants: ITenant[]): any[] {
    return tenants?.map(tenant => ({ name: tenant.name, value: tenant._id })) ?? [];
  }

  private listenToTokenChange(): void {
    this.store.select(SessionStorageState.accessToken)
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((token: string) => this.tenantsOptions = this.formatTenantsOptions(this.userService.userTenants()));
  }
}
