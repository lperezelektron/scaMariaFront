import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { UserStorageService } from '../storage/user-storage.service';

export function permissionMatch(required: string | string[]): CanMatchFn {
  return () => {
    const router = inject(Router);
    const userStorage = inject(UserStorageService);

    const need = Array.isArray(required) ? required : [required];
    const ok = userStorage.hasAny(need);

    if (!ok) return router.parseUrl('/403'); 
    return true;
  };
}