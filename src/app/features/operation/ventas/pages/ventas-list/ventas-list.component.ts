import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  BadgeComponent,
  ButtonDirective,
  SpinnerComponent,
  TableDirective,
} from '@coreui/angular';

import { VentasListService } from '../../data/ventas-list.service';
import { AlmacenesService } from '../../../../settings/pages/almacenes/data/almacenes.service';
import { VentaListItem, PaginatedResponse } from '../../data/ventas-list.models';
import { Almacen } from '../../../../settings/pages/almacenes/data/almacenes.models';

@Component({
  selector: 'app-ventas-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonDirective,
    SpinnerComponent,
    TableDirective,
    BadgeComponent,
  ],
  templateUrl: './ventas-list.component.html',
  styleUrl: './ventas-list.component.scss',
})
export class VentasListComponent {
  private ventasSvc    = inject(VentasListService);
  private almacenesSvc = inject(AlmacenesService);
  private router       = inject(Router);
  private destroyRef   = inject(DestroyRef);

  loading  = signal(false);
  almacenes = signal<Almacen[]>([]);

  items    = signal<VentaListItem[]>([]);
  total    = signal(0);
  page     = signal(1);
  perPage  = signal(25);
  lastPage = signal(1);

  banner = signal<{ type: 'success' | 'danger' | 'info'; text: string } | null>(null);

  hasPaging = computed(() => this.lastPage() > 1);

  private today(): string {
    return new Date().toISOString().split('T')[0];
  }

  filtros = new FormGroup({
    almacen_id: new FormControl<number | null>(null),
    fecha: new FormControl<string | null>(this.today()),
  });

  constructor() {
    this.loadAlmacenes();
    this.fetch(1);

    this.filtros.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.page.set(1);
        this.fetch(1);
      });
  }

  reload() {
    this.banner.set(null);
    this.fetch(this.page());
  }

  loadAlmacenes() {
    this.almacenesSvc.list({ activo: true }).subscribe({
      next: (res: Almacen[]) => this.almacenes.set(res),
    });
  }

  fetch(page?: number) {
    if (page) this.page.set(page);

    const f = this.filtros.getRawValue();

    this.loading.set(true);

    this.ventasSvc
      .list({
        page: this.page(),
        per_page: this.perPage(),
        fecha: f.fecha,
        almacen_id: f.almacen_id,
      })
      .subscribe({
        next: (res: any) => {
          if (Array.isArray(res)) {
            const sorted = [...res].sort((a, b) => b.id - a.id);
            this.items.set(sorted);
            this.total.set(res.length);
            this.lastPage.set(1);
          } else {
            const pag = res as PaginatedResponse<VentaListItem>;
            this.items.set(pag.data ?? []);
            this.total.set(pag.total ?? 0);
            this.lastPage.set(pag.last_page ?? 1);
            this.page.set(pag.current_page ?? this.page());
            this.perPage.set(pag.per_page ?? this.perPage());
          }

          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.banner.set({ type: 'danger', text: 'No se pudieron cargar las ventas.' });
        },
      });
  }

  clearFilters() {
    this.filtros.reset({ almacen_id: null, fecha: this.today() });
  }

  ver(item: VentaListItem) {
    this.router.navigate(['/operation/ventas', item.id, 'ver']);
  }

  imprimir(item: VentaListItem) {
    this.router.navigate(['/operation/ventas', item.id, 'ver'], {
      queryParams: { print: '1' },
    });
  }

  prev() {
    if (this.page() <= 1) return;
    this.fetch(this.page() - 1);
  }

  next() {
    if (this.page() >= this.lastPage()) return;
    this.fetch(this.page() + 1);
  }

  estatusBadge(estatus?: string | null): string {
    const s = (estatus ?? 'activa').toLowerCase();
    if (s === 'cancelada') return 'danger';
    if (s === 'credito')   return 'warning';
    return 'success';
  }

  estatusLabel(estatus?: string | null): string {
    const s = (estatus ?? 'activa').toLowerCase();
    if (s === 'cancelada') return 'Cancelada';
    if (s === 'credito')   return 'Crédito';
    return 'Pagada';
  }
}
