import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { MAGIC_NUMBERS } from '@core/shared/constants';
import { ROLES } from '@shared/constants';
import { UserService } from '@shared/services';

@Injectable()
export class AdminGuard implements CanActivate {

  private userService = inject(UserService);
  private router = inject(Router);

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    if (!this.userService.isLoggedIn() || !this.userService.loggedUser()?.role) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const allowedRoles: string[] = route.data?.['roles'] ?? [];
    if (!allowedRoles || allowedRoles.length === MAGIC_NUMBERS.N_0) {
      allowedRoles.push(ROLES.ADMIN);
      allowedRoles.push(ROLES.SUPERADMIN);
    }

    if (!allowedRoles.includes(this.userService.loggedUser().role.name)) {
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}
