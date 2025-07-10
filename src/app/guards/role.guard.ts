import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = JSON.parse(localStorage.getItem('user_info') || '{}');
    const allowedRoles = route.data['roles'] as string[];
    if (user && user.roles && allowedRoles.some(role => user.roles.includes(role))) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
