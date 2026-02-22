import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';

import { IconDirective } from '@coreui/icons-angular';
import {
  ContainerComponent,
  ShadowOnScrollDirective,
  SidebarBrandComponent,
  SidebarComponent,
  SidebarFooterComponent,
  SidebarHeaderComponent,
  SidebarNavComponent,
  SidebarToggleDirective,
  SidebarTogglerDirective,
} from '@coreui/angular';

import { DefaultFooterComponent, DefaultHeaderComponent } from './';
import { navItems, INavDataPerm } from './_nav';
import { TokenStorageService } from '../../core/storage/token-storage.service';
import { UserStorageService } from '../../core/storage/user-storage.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
  standalone: true,
  imports: [
    SidebarComponent,
    SidebarHeaderComponent,
    SidebarBrandComponent,
    RouterLink,
    IconDirective,
    NgScrollbar,
    SidebarNavComponent,
    SidebarFooterComponent,
    SidebarToggleDirective,
    SidebarTogglerDirective,
    DefaultHeaderComponent,
    ShadowOnScrollDirective,
    ContainerComponent,
    RouterOutlet,
    DefaultFooterComponent,
  ],
})
export class DefaultLayoutComponent {
  private router = inject(Router);
  private tokenStorage = inject(TokenStorageService);
  private userStorage = inject(UserStorageService);

  public navItems: INavDataPerm[] = [];

  constructor() {
    const perms = new Set(this.userStorage.permisos());
    this.navItems = this.filterNavItems(navItems, perms);
  }

  private filterNavItems(items: INavDataPerm[], perms: Set<string>): INavDataPerm[] {
    const result: INavDataPerm[] = [];

    for (const item of items) {
      // Los títulos los agregamos provisionalmente y luego limpiamos los "colgados"
      if (item.title) {
        result.push(item);
        continue;
      }

      const need = item.permissions;
      const allowed = !need || need.some(p => perms.has(p));
      if (!allowed) continue;

      // Si tiene hijos, filtrarlos también
      if (item.children?.length) {
        const filteredChildren = this.filterNavItems(item.children, perms);
        if (filteredChildren.length === 0) continue;

        result.push({ ...item, children: filteredChildren });
      } else {
        result.push(item);
      }
    }

    // Quitar títulos "colgados" (si no hay items reales después)
    return result.filter((it, idx, arr) => {
      if (!it.title) return true;
      const next = arr[idx + 1];
      return !!next && !next.title;
    });
  }

  logout(): void {
    this.tokenStorage.clear();
    this.userStorage.clear();
    this.router.navigate(['/login']);
  }

  onScrollbarUpdate($event: any) {}
}