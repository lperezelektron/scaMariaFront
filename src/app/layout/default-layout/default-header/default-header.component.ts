import { NgStyle, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import {
  AvatarComponent,
  BadgeComponent,
  BreadcrumbRouterComponent,
  ColorModeService,
  ContainerComponent,
  DropdownComponent,
  DropdownDividerDirective,
  DropdownHeaderDirective,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  HeaderComponent,
  HeaderNavComponent,
  HeaderTogglerDirective,
  NavItemComponent,
  NavLinkDirective,
  ProgressBarDirective,
  ProgressComponent,
  SidebarToggleDirective,
  TextColorDirective,
  ThemeDirective,
  ButtonDirective,
  ButtonCloseDirective,
} from '@coreui/angular';

import { IconDirective } from '@coreui/icons-angular';
import { AuthService } from 'src/app/core/auth/auth.service';
import { UserStorageService } from 'src/app/core/storage/user-storage.service';
import { NavigationHistoryService, NavigationItem } from 'src/app/core/services/navigation-history.service';

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
  standalone: true,
  imports: [
    ContainerComponent,
    HeaderTogglerDirective,
    SidebarToggleDirective,
    IconDirective,
    HeaderNavComponent,
    NavItemComponent,
    NavLinkDirective,
    RouterLink,
    RouterLinkActive,
    NgTemplateOutlet,
    BreadcrumbRouterComponent,
    ThemeDirective,
    DropdownComponent,
    DropdownToggleDirective,
    TextColorDirective,
    AvatarComponent,
    DropdownMenuDirective,
    DropdownHeaderDirective,
    DropdownItemDirective,
    BadgeComponent,
    DropdownDividerDirective,
    ProgressBarDirective,
    ProgressComponent,
    NgStyle,
    ButtonDirective,
    ButtonCloseDirective,
  ],
})
export class DefaultHeaderComponent extends HeaderComponent {
  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;

  private router = inject(Router);
  private auth = inject(AuthService);
  private userStorage = inject(UserStorageService);
  private navHistory = inject(NavigationHistoryService);

  // Rutas fijas y dinámicas
  public fixedRoutes: NavigationItem[] = [];
  public dynamicRoutes = this.navHistory.history;

  readonly colorModes = [
    { name: 'light', text: 'Light', icon: 'cilSun' },
    { name: 'dark', text: 'Dark', icon: 'cilMoon' },
    { name: 'auto', text: 'Auto', icon: 'cilContrast' },
  ];

  readonly icons = computed(() => {
    const currentMode = this.colorMode();
    return (
      this.colorModes.find((mode) => mode.name === currentMode)?.icon ??
      'cilSun'
    );
  });

  constructor() {
    super();
    this.fixedRoutes = this.navHistory.getFixedRoutes();
  }

  removeFromHistory(url: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.navHistory.removeFromHistory(url);
  }

  isActiveRoute(url: string): boolean {
    return this.router.url.startsWith(url);
  }

  getUserInitials(): string {
    const user = this.userStorage.get();
    if (!user?.name) return 'U';
    
    const names = user.name.trim().split(' ');
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }

  logout(ev?: Event) {
    console.log('Logout clicked');
    ev?.preventDefault();
    console.log('Logout clicked - event prevented');
    // si tu backend requiere logout real, úsalo:
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        // aunque falle el endpoint, limpiamos token en AuthService.logout()
        this.router.navigate(['/login']);
      },
    });
  }

  sidebarId = input('sidebar1');
}
