import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ITenant } from '@shared/interfaces';
import { SelectTenantService } from '@shared/services';
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

  private readonly selectTenantService = inject(SelectTenantService);

  ngOnInit() {
    this.tenantsOptions = this.formatTenantsOptions(this.selectTenantService.tenants);
    this.initForm();
    this.fillForm(this.selectTenantService.tenants);
  }

  public onChangeValue($event: any): void {
    const value = $event?.value;
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
}
