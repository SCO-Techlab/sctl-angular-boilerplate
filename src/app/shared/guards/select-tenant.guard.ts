import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { MAGIC_NUMBERS } from '@core/shared';
import { environment } from '@environment';
import { SelectTenantService, UserService } from '@shared/services';

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

    this.selectTenantService.selectedTenant = !this.selectTenantService.selectedTenant
      ? this.userService.userTenants()?.[MAGIC_NUMBERS.N_0]?._id
      : this.selectTenantService.selectedTenant;

    return true;
  }
}
