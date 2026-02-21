import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { TokenStorageService } from '../storage/token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private token: TokenStorageService,
    private router: Router,
  ) {}

  canActivate(): boolean | UrlTree {
    if (this.token.get()) return true;
    return this.router.parseUrl('/login');
  }
}
