import { Injectable } from '@angular/core';

const USER_KEY = 'limonero_user';

export interface LimoneroUser {
  id: number;
  name: string;
  email: string;
  role: string;
  permisos: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserStorageService {

  get(): LimoneroUser | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as LimoneroUser) : null;
  }

  set(user: LimoneroUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  clear(): void {
    localStorage.removeItem(USER_KEY);
  }

  permisos(): string[] {
    return this.get()?.permisos ?? [];
  }

  hasPermission(permission: string): boolean {
    return this.permisos().includes(permission);
  }

  hasAny(permissions: string[]): boolean {
    const userPerms = this.permisos();
    return permissions.some(p => userPerms.includes(p));
  }

  role(): string | null {
    return this.get()?.role ?? null;
  }
}
