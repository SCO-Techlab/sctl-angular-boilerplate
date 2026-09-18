import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { MAGIC_NUMBERS } from '@core/shared';
import { environment } from '@environment';
import { SelectTenantService, UserService } from '@shared/services';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class SelectTenantGuard implements CanActivate {

  private readonly userService = inject(UserService);
  private readonly selectTenantService = inject(SelectTenantService);

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    if (!this.userService.isLoggedIn()) {
      return false;
    }

    if (!environment.multitenancyEnabled) {
      return true;
    }

    if (this.selectTenantService.tenants?.length) {
      return true;
    }

    const tenants = await lastValueFrom(this.selectTenantService.getUserTenants(this.userService.loggedUser()._id));
    this.selectTenantService.tenants = tenants;
    this.selectTenantService.selectedTenant = tenants?.[MAGIC_NUMBERS.N_0]?._id ?? '';
    return true;
  }
}
