import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from '../../../core/storage/token-storage.service';
import { UserStorageService } from '../../../core/storage/user-storage.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss',
})
export class LogoutComponent {
  private router = inject(Router);
  private token = inject(TokenStorageService);
  private user = inject(UserStorageService);

  constructor() {
    this.token.clear();
    this.user.clear();
    this.router.navigateByUrl('/login');
  }
}
