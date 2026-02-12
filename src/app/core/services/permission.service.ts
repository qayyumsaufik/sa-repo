import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private permissions = signal<Set<string>>(new Set());
  private roles = signal<Set<string>>(new Set());

  /**
   * Expose permissions as a readonly signal for components to observe
   */
  readonly permissions$ = this.permissions.asReadonly();

  /**
   * Expose roles as a readonly signal for components to observe
   */
  readonly roles$ = this.roles.asReadonly();

  /**
   * Check if user has a specific permission.
   * For "View X", returns true if user has "View X" OR "Manage X".
   */
  hasPermission(permission: string): boolean {
    const userPermissions = this.permissions();
    if (userPermissions.has(permission)) return true;
    if (permission.startsWith('View ')) {
      const manageName = 'Manage ' + permission.slice(5);
      if (userPermissions.has(manageName)) return true;
    }
    return false;
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: string[]): boolean {
    const userPermissions = this.permissions();
    return permissions.some(permission => userPermissions.has(permission));
  }

  /**
   * Check if user has all of the specified permissions (View X is satisfied by Manage X).
   */
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * Get all user permissions
   */
  getPermissions(): string[] {
    return Array.from(this.permissions());
  }

  /**
   * Manually set permissions (useful for testing or manual updates)
   */
  setPermissions(permissions: string[]): void {
    this.permissions.set(new Set(permissions));
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: string): boolean {
    return this.roles().has(role);
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.roles();
    return roles.some(role => userRoles.has(role));
  }

  /**
   * Get all user roles
   */
  getRoles(): string[] {
    return Array.from(this.roles());
  }

  /**
   * Manually set roles (useful for testing or manual updates)
   */
  setRoles(roles: string[]): void {
    this.roles.set(new Set(roles));
  }

  /**
   * Clear all user permissions and roles.
   * This should be called on logout.
   */
  clearPermissions(): void {
    this.permissions.set(new Set());
    this.roles.set(new Set());
  }
}
