import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
  SpinnerComponent,
  TableDirective,
  BadgeComponent,
} from '@coreui/angular';
import { ComprasService } from '../../data/compras.service';
import { ProveedoresService } from '../../../proveedores/data/proveedores.service';
import { Compra, PaginatedResponse } from '../../data/compras.models';
import { Proveedor } from '../../../proveedores/data/proveedores.models';
import { HasPermissionDirective } from '../../../../../core/directives/has-permission.directive';

@Component({
  selector: 'app-compras-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    ButtonDirective,
    SpinnerComponent,
    TableDirective,
    BadgeComponent,
    HasPermissionDirective
  ],
  templateUrl: './compras-list.component.html',
  styleUrl: './compras-list.component.scss',
})
export class ComprasListComponent {
  private comprasSvc = inject(ComprasService);
  private proveedoresSvc = inject(ProveedoresService);
  private router = inject(Router);

  loading = signal(false);

  items = signal<Compra[]>([]);
  total = signal(0);
  page = signal(1);
  perPage = signal(15);
  lastPage = signal(1);

  proveedores = signal<Proveedor[]>([]);

  filtros = new FormGroup({
    proveedor_id: new FormControl<number | null>(null),
    fecha_inicio: new FormControl<string | null>(null),
    fecha_fin: new FormControl<string | null>(null),
    mes: new FormControl<number | null>(null),
    anio: new FormControl<number | null>(null),
  });

  hasPaging = computed(() => this.lastPage() > 1);

  constructor() {
    this.loadProveedores();
    effect(() => {
      // carga inicial
      this.fetch();
    });
  }

  loadProveedores() {
    this.proveedoresSvc.list({ per_page: 200, page: 1, activo: true }).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        this.proveedores.set(data);
      },
    });
  }

  fetch(page?: number) {
    if (page) this.page.set(page);

    const f = this.filtros.getRawValue();

    this.loading.set(true);
    this.comprasSvc
      .list({
        page: this.page(),
        per_page: this.perPage(),
        proveedor_id: f.proveedor_id,
        fecha_inicio: f.fecha_inicio,
        fecha_fin: f.fecha_fin,
        mes: f.mes,
        anio: f.anio,
      })
      .subscribe({
        next: (res: any) => {
          if (Array.isArray(res)) {
            this.items.set(res);
            this.total.set(res.length);
            this.lastPage.set(1);
          } else {
            const pag = res as PaginatedResponse<Compra>;
            this.items.set(pag.data ?? []);
            this.total.set(pag.total ?? 0);
            this.lastPage.set(pag.last_page ?? 1);
            this.page.set(pag.current_page ?? this.page());
            this.perPage.set(pag.per_page ?? this.perPage());
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  applyFilters() {
    this.fetch(1);
  }

  clearFilters() {
    this.filtros.reset({
      proveedor_id: null,
      fecha_inicio: null,
      fecha_fin: null,
      mes: null,
      anio: null,
    });
    this.fetch(1);
  }

  goNew() {
    this.router.navigate(['/catalog/compras/nuevo']);
  }

  open(item: Compra) {
    this.router.navigate(['/catalog/compras', item.id]);
  }

  prev() {
    if (this.page() <= 1) return;
    this.fetch(this.page() - 1);
  }

  next() {
    if (this.page() >= this.lastPage()) return;
    this.fetch(this.page() + 1);
  }

  badge(estatus?: string | null) {
    const s = (estatus ?? 'activa').toLowerCase();
    if (s === 'cancelada') return 'danger';
    return 'success';
  }

  labelStatus(estatus?: string | null) {
    const s = (estatus ?? 'activa').toLowerCase();
    return s === 'cancelada' ? 'Cancelada' : 'Activa';
  }
}