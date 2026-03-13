import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
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

    const adminRoles = [ROLES.ADMIN, ROLES.SUPERADMIN];
    if (!adminRoles.includes(this.userService.loggedUser().role.name)) {
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}
