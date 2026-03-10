import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';

import {
  ButtonDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
} from '@coreui/angular';

import { CajaService } from '../../data/caja.service';
import { MovimientoCaja } from '../../data/caja.models';
import { HasPermissionDirective } from '../../../../core/directives/has-permission.directive';

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,
    ButtonDirective,
    ModalComponent,
    ModalHeaderComponent,
    ModalBodyComponent,
    ModalFooterComponent,
    HasPermissionDirective,
  ],
  templateUrl: './caja.component.html',
  styleUrl: './caja.component.scss',
})
export class CajaComponent {
  private gridApi?: GridApi;

  // filtros
  fecha = signal('');
  tipoFilter = signal('');

  // resumen
  saldoActual   = signal(0);
  totalEntradas = signal(0);
  totalSalidas  = signal(0);

  // data
  rows = signal<MovimientoCaja[]>([]);

  banner = signal<{ type: 'success' | 'danger'; text: string } | null>(null);

  // modal movimiento
  modalVisible = signal(false);
  saving       = signal(false);

  movimientoForm = new FormGroup({
    tipo:       new FormControl<'Entrada' | 'Salida'>('Entrada', Validators.required),
    cantidad:   new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    referencia: new FormControl<string>('', [Validators.required, Validators.maxLength(255)]),
  });

  defaultColDef: ColDef = { sortable: true, resizable: true, filter: false };

  overlayNoRowsTemplate = `<div class="ag-overlay-msg">No hay movimientos para mostrar.</div>`;
  overlayLoadingTemplate = `<div class="ag-overlay-msg">Cargando...</div>`;

  colDefs: ColDef<MovimientoCaja>[] = [
    { headerName: 'ID', field: 'id', width: 80 },
    {
      headerName: 'Fecha',
      field: 'fecha',
      width: 130,
      valueFormatter: (p) => p.value ? new Date(p.value).toLocaleDateString('es-MX') : '-',
    },
    {
      headerName: 'Tipo',
      field: 'tipo',
      width: 110,
      valueFormatter: (p) => p.value === 'entrada' ? 'Entrada' : 'Salida',
      cellStyle: (p) => ({ color: p.value === 'entrada' ? '#198754' : '#dc3545', fontWeight: 600 }),
    },
    {
      headerName: 'Cantidad',
      field: 'cantidad',
      width: 130,
      valueFormatter: (p) => p.value != null ? `$${Number(p.value).toFixed(2)}` : '-',
      type: 'rightAligned',
    },
    { headerName: 'Referencia', field: 'referencia', flex: 1, minWidth: 200 },
    {
      headerName: 'Usuario',
      valueGetter: (p) => p.data?.user?.name ?? '-',
      width: 160,
    },
  ];

  constructor(
    private cajaSvc: CajaService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    const qp = this.route.snapshot.queryParams;
    if (qp['fecha']) this.fecha.set(String(qp['fecha']));
    if (qp['tipo'])  this.tipoFilter.set(String(qp['tipo']));
  }

  onGridReady(e: GridReadyEvent) {
    this.gridApi = e.api;
    this.reload();
  }

  reload() {
    this.banner.set(null);
    this.gridApi?.showLoadingOverlay();

    this.cajaSvc.index({
      fecha: this.fecha() || undefined,
      tipo: this.tipoFilter() || undefined,
    }).subscribe({
      next: (res) => {
        this.rows.set(res.movimientos);
        this.saldoActual.set(res.saldo_actual);
        this.totalEntradas.set(res.totales.entradas);
        this.totalSalidas.set(res.totales.salidas);

        if (!res.movimientos?.length) {
          this.gridApi?.showNoRowsOverlay();
        } else {
          this.gridApi?.hideOverlay();
        }
      },
      error: () => {
        this.gridApi?.hideOverlay();
        this.banner.set({ type: 'danger', text: 'No se pudo cargar la caja.' });
      },
    });
  }

  onFecha(value: string) {
    this.fecha.set(value);
    this.syncQueryParams();
    this.reload();
  }

  onTipo(value: string) {
    this.tipoFilter.set(value);
    this.syncQueryParams();
    this.reload();
  }

  limpiarFiltros() {
    this.fecha.set('');
    this.tipoFilter.set('');
    this.syncQueryParams();
    this.reload();
  }

  // ── Modal movimiento ──────────────────────────────────────

  openModal() {
    this.movimientoForm.reset({ tipo: 'Entrada', cantidad: null, referencia: '' });
    this.modalVisible.set(true);
  }

  closeModal() {
    this.modalVisible.set(false);
  }

  confirmarMovimiento() {
    if (this.movimientoForm.invalid) return;

    const { tipo, cantidad, referencia } = this.movimientoForm.getRawValue();

    this.saving.set(true);

    this.cajaSvc.movimiento({ tipo: tipo!, cantidad: cantidad!, referencia: referencia! }).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.modalVisible.set(false);
        this.banner.set({ type: 'success', text: res.message });
        this.reload();
      },
      error: (err) => {
        this.saving.set(false);
        this.banner.set({
          type: 'danger',
          text: err?.error?.message ?? 'No se pudo registrar el movimiento.',
        });
      },
    });
  }

  private syncQueryParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        fecha: this.fecha() || undefined,
        tipo: this.tipoFilter() || undefined,
      },
      replaceUrl: true,
    });
  }
}
