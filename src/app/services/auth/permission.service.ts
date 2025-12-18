import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  constructor(private auth: AuthService) {}

  hasPermission(moduleName: string, permission: string = ''): boolean {
    const user = this.auth.user(); // ✅ signal read

    if (!user || !user.userMenu) return false;

    const module = user.userMenu.find(
      (m: any) =>
        m.menuName?.toLowerCase() === moduleName.toLowerCase()
    );

    if (!module) return false;

    // Only module access check
    if (!permission) return true;

    if (!Array.isArray(module.permissions)) return false;

    return module.permissions.some(
      (p: string) =>
        p.toLowerCase() === permission.toLowerCase()
    );
  }
}
