import { NgStyle, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { navItems, INavDataPerm } from '../_nav'; 


type TopLink = { name: string; url: string };

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
} from '@coreui/angular';

import { IconDirective } from '@coreui/icons-angular';
import { AuthService } from 'src/app/core/auth/auth.service';
import { UserStorageService } from 'src/app/core/storage/user-storage.service';

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
  ],
})
export class DefaultHeaderComponent extends HeaderComponent {
  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;

  private router = inject(Router);
  private auth = inject(AuthService);
  private userStorage = inject(UserStorageService);

  public topLinks: TopLink[] = [];

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
    this.topLinks = this.buildTopLinks(navItems);
  }

  private buildTopLinks(items: INavDataPerm[]): TopLink[] {
    // Solo padres: items de primer nivel (navItems ya lo es), excluye titles y logout
    const parents = items.filter(
      (i) => !i.title && !!i.url && i.url !== '/logout',
    );

    // Filtrar por permisos (si el padre tiene children, se muestra si:
    // - el padre está permitido, o
    // - cualquier child está permitido
    const allowedParents = parents.filter((i) => this.canSee(i));

    // Convertir a links para el menú superior
    return allowedParents.map((i) => ({
      name: String(i.name ?? ''),
      url: String(i.url ?? ''),
    }));
  }

  private canSee(item: INavDataPerm): boolean {
    const perms = item.permissions;

    // si no pide permisos -> visible
    if (!perms || perms.length === 0) return true;

    // si el usuario tiene alguno
    if (this.userStorage.hasAny(perms)) return true;

    // si NO tiene permisos directos, pero algún hijo sí, mostramos el padre
    if (item.children?.length) {
      return item.children.some((ch) => this.canSee(ch));
    }

    return false;
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
