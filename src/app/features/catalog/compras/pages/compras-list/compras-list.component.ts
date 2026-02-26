import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, SelectionChangedEvent } from 'ag-grid-community';

import { HasPermissionDirective } from '../../../../../core/directives/has-permission.directive';
import { ComprasService } from '../../data/compras.service';
import { Compra, ProveedorMini } from '../../data/compras.models';
import { ProveedoresService } from '../../../proveedores/data/proveedores.service'; // ajusta ruta si difiere

@Component({
  selector: 'app-compras-list',
  standalone: true,
  imports: [CommonModule, AgGridAngular, HasPermissionDirective, FormsModule],
  templateUrl: './compras-list.component.html',
  styleUrl: './compras-list.component.scss'
})
export class ComprasListComponent {
  private gridApi?: GridApi;

  loading = signal(false);
  rows = signal<Compra[]>([]);
  selectedId = signal<number | null>(null);

  // filtros
  proveedorId = signal<number | null>(null);
  fechaInicio = signal<string | null>(null);
  fechaFin = signal<string | null>(null);
  mes = signal<number | null>(null);
  anio = signal<number | null>(null);

  proveedores = signal<ProveedorMini[]>([]);

  // paginación
  page = signal(1);
  pageSize = signal(25);
  total = signal(0);
  lastPage = signal(1);

  banner = signal<{ type: 'success' | 'danger' | 'info'; text: string } | null>(null);

  defaultColDef: ColDef = { sortable: true, resizable: true, filter: false };

  colDefs: ColDef<Compra>[] = [
    { headerName: 'ID', field: 'id', width: 90 },
    { headerName: 'Fecha', field: 'fecha', width: 120 },
    { headerName: 'Referencia', field: 'referencia', width: 150 },
    {
      headerName: 'Proveedor',
      flex: 1,
      minWidth: 260,
      valueGetter: (p) => p.data?.proveedor?.nombre ?? '-',
    },
    {
      headerName: 'Total',
      field: 'total',
      width: 140,
      valueFormatter: (p) => this.money(p.value),
    },
    {
      headerName: 'Estatus',
      field: 'estatus',
      width: 130,
      valueFormatter: (p) => p.value ?? 'activa',
    },
  ];

  overlayNoRowsTemplate = `<div class="ag-overlay-msg">No hay compras para mostrar.</div>`;
  overlayLoadingTemplate = `<div class="ag-overlay-msg">Cargando...</div>`;

  constructor(
    private comprasSvc: ComprasService,
    private proveedoresSvc: ProveedoresService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    const qp = this.route.snapshot.queryParams;
    if (qp['proveedor_id']) this.proveedorId.set(Number(qp['proveedor_id']));
    if (qp['fecha_inicio']) this.fechaInicio.set(String(qp['fecha_inicio']));
    if (qp['fecha_fin']) this.fechaFin.set(String(qp['fecha_fin']));
    if (qp['mes']) this.mes.set(Number(qp['mes']));
    if (qp['anio']) this.anio.set(Number(qp['anio']));
    if (qp['page']) this.page.set(Number(qp['page']));
    if (qp['per_page']) this.pageSize.set(Number(qp['per_page']));

    this.loadProveedores();
  }

  onGridReady(e: GridReadyEvent) {
    this.gridApi = e.api;
    this.reload();
  }

  onSelectionChanged(e: SelectionChangedEvent) {
    const row = e.api.getSelectedRows()?.[0] as Compra | undefined;
    this.selectedId.set(row?.id ?? null);
  }

  reload() {
    this.banner.set(null);
    this.selectedId.set(null);
    this.gridApi?.deselectAll();
    this.gridApi?.showLoadingOverlay();

    this.comprasSvc
      .list({
        proveedor_id: this.proveedorId(),
        fecha_inicio: this.fechaInicio(),
        fecha_fin: this.fechaFin(),
        mes: this.mes(),
        anio: this.anio(),
        per_page: this.pageSize(),
        page: this.page(),
      })
      .subscribe({
        next: (res: any) => {
          const data = Array.isArray(res) ? res : (res?.data ?? []);
          this.rows.set(data);

          const total = Number(res?.total ?? data.length ?? 0);
          const last = Number(res?.last_page ?? 1);

          this.total.set(total);
          this.lastPage.set(last);

          if (!data || data.length === 0) this.gridApi?.showNoRowsOverlay();
          else this.gridApi?.hideOverlay();
        },
        error: () => {
          this.gridApi?.hideOverlay();
          this.banner.set({ type: 'danger', text: 'No se pudo cargar el listado.' });
        },
      });
  }

  goNew() {
    this.router.navigate(['/catalog/compras/nuevo'], { queryParams: this.route.snapshot.queryParams });
  }

  goView() {
    const id = this.selectedId();
    if (!id) return;
    this.router.navigate(['/catalog/compras', id, 'ver'], { queryParams: this.route.snapshot.queryParams });
  }

  // filtros
  applyFilters() {
    this.page.set(1);
    this.syncQueryParams();
    this.reload();
  }

  clearFilters() {
    this.proveedorId.set(null);
    this.fechaInicio.set(null);
    this.fechaFin.set(null);
    this.mes.set(null);
    this.anio.set(null);
    this.page.set(1);
    this.syncQueryParams();
    this.reload();
  }

  prevPage() {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
      this.syncQueryParams();
      this.reload();
    }
  }

  nextPage() {
    if (this.page() < this.lastPage()) {
      this.page.set(this.page() + 1);
      this.syncQueryParams();
      this.reload();
    }
  }

  onPageSize(v: string) {
    this.pageSize.set(Number(v));
    this.page.set(1);
    this.syncQueryParams();
    this.reload();
  }

  private syncQueryParams() {
    const qp: any = {
      proveedor_id: this.proveedorId() ?? undefined,
      fecha_inicio: this.fechaInicio() ?? undefined,
      fecha_fin: this.fechaFin() ?? undefined,
      mes: this.mes() ?? undefined,
      anio: this.anio() ?? undefined,
      page: this.page(),
      per_page: this.pageSize(),
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: qp,
      replaceUrl: true,
    });
  }

  private loadProveedores() {
    // uso tu endpoint proveedores con per_page opcional
    this.proveedoresSvc.list({ per_page: 500 }).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        this.proveedores.set(data);
      },
      error: () => this.proveedores.set([]),
    });
  }

  toNumber(v: any): number | null {
    if (v === null || v === undefined || v === '') return null;
    const n = typeof v === 'string' ? Number(v) : Number(v);
    return Number.isFinite(n) ? n : null;
  }

  private money(v: any): string {
    const n = this.toNumber(v);
    return (n ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}