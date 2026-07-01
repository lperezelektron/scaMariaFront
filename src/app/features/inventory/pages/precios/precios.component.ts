import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { CellClickedEvent, ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import {
  ButtonDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
} from '@coreui/angular';
import * as XLSX from 'xlsx';

import { AlmacenesService } from '../../../settings/pages/almacenes/data/almacenes.service';
import { Almacen, InventarioItem } from '../../../settings/pages/almacenes/data/almacenes.models';
import { CategoriasService } from '../../../catalog/articulos/data/categorias.service';
import { InventarioService } from '../../../../../app/features/reporte/data/inventario.service';
import { UserStorageService } from '../../../../core/storage/user-storage.service';

@Component({
  selector: 'app-precios',
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
  ],
  templateUrl: './precios.component.html',
  styleUrl: './precios.component.scss',
})
export class PreciosComponent {
  @ViewChild('importInput') importInput!: ElementRef<HTMLInputElement>;
  private gridApi?: GridApi;

  // almacén
  almacenId = signal<number | null>(null);
  almacenes = signal<Almacen[]>([]);

  // categorías
  categorias  = signal<{ id: number; descripcion: string }[]>([]);
  categoriaId = signal<number | 'all'>('all');

  // búsqueda
  search = signal('');

  // data
  allRows = signal<InventarioItem[]>([]);
  filteredRows = computed(() => {
    const cat = this.categoriaId();
    return cat === 'all'
      ? this.allRows()
      : this.allRows().filter(r => r.articulo?.categoria?.id === cat);
  });

  banner = signal<{ type: 'success' | 'danger'; text: string } | null>(null);
  importing = signal(false);

  // modal edición
  editModalVisible = signal(false);
  editItem         = signal<InventarioItem | null>(null);
  saving           = signal(false);

  editForm = new FormGroup({
    precio:          new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    precio_mayoreo:  new FormControl<number | null>(null, [Validators.min(0)]),
    cant_mayoreo:    new FormControl<number | null>(null, [Validators.min(0.001)]),
    precio_menudeo:  new FormControl<number | null>(null, [Validators.min(0)]),
    cant_menudeo:    new FormControl<number | null>(null, [Validators.min(0.001)]),
    precio_min:      new FormControl<number | null>(null, [Validators.min(0)]),
  });

  defaultColDef: ColDef = { sortable: true, resizable: true, filter: false };

  overlayNoRowsTemplate  = `<div class="ag-overlay-msg">No hay artículos para mostrar.</div>`;
  overlayLoadingTemplate = `<div class="ag-overlay-msg">Cargando...</div>`;

  private fmt = (v: any) => v != null ? `$${Number(v).toFixed(2)}` : '-';
  private fmtNum = (v: any) => v != null ? Number(v).toFixed(3) : '-';

  colDefs: ColDef<InventarioItem>[] = [
    {
      headerName: '',
      colId: 'acciones',
      width: 90,
      sortable: false,
      resizable: false,
      cellRenderer: () => `<button class="btn btn-sm btn-outline-primary">Editar</button>`,
    },
    {
      headerName: 'Artículo',
      valueGetter: (p) => p.data?.articulo?.nombre ?? '-',
      flex: 1,
      minWidth: 200,
    },
    {
      headerName: 'Nombre corto',
      valueGetter: (p) => p.data?.articulo?.nombre_corto ?? '-',
      width: 140,
    },
    {
      headerName: 'Variedad',
      field: 'variedad',
      width: 130,
      valueFormatter: (p) => p.value ?? '-',
    },
    {
      headerName: 'Existencia',
      field: 'existencia',
      width: 110,
      type: 'rightAligned',
      valueFormatter: (p) => p.value != null ? Number(p.value).toFixed(2) : '-',
      cellStyle: (p) => Number(p.value) <= 10 ? { color: '#dc3545', fontWeight: 600 } : null,
    },
    {
      headerName: 'Unidad',
      valueGetter: (p) => p.data?.articulo?.unidad ?? '-',
      width: 80,
    },
    {
      headerName: 'Precio',
      field: 'precio',
      width: 110,
      type: 'rightAligned',
      valueFormatter: (p) => this.fmt(p.value),
    },
    {
      headerName: 'Mayoreo',
      field: 'precio_mayoreo',
      width: 110,
      type: 'rightAligned',
      valueFormatter: (p) => this.fmt(p.value),
      headerTooltip: 'Precio de mayoreo',
    },
    {
      headerName: 'Cant. May.',
      field: 'cant_mayoreo',
      width: 105,
      type: 'rightAligned',
      valueFormatter: (p) => this.fmtNum(p.value),
      headerTooltip: 'Cantidad mínima para precio mayoreo',
    },
    {
      headerName: 'Menudeo',
      field: 'precio_menudeo',
      width: 110,
      type: 'rightAligned',
      valueFormatter: (p) => this.fmt(p.value),
      headerTooltip: 'Precio de menudeo',
    },
    {
      headerName: 'Cant. Men.',
      field: 'cant_menudeo',
      width: 105,
      type: 'rightAligned',
      valueFormatter: (p) => this.fmtNum(p.value),
      headerTooltip: 'Cantidad máxima para precio menudeo',
    },
    {
      headerName: 'Precio mín.',
      field: 'precio_min',
      width: 110,
      type: 'rightAligned',
      valueFormatter: (p) => this.fmt(p.value),
    },
    {
      headerName: 'Costo',
      field: 'costo',
      width: 110,
      type: 'rightAligned',
      valueFormatter: (p) => this.fmt(p.value),
    },
    {
      headerName: 'Empaque',
      field: 'empaque',
      width: 100,
      type: 'rightAligned',
      valueFormatter: (p) => this.fmtNum(p.value),
    },
  ];

  constructor(
    private almacenesSvc: AlmacenesService,
    private inventarioSvc: InventarioService,
    private categoriasSvc: CategoriasService,
    private userStorage: UserStorageService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    const qp = this.route.snapshot.queryParams;
    if (qp['search'])       this.search.set(String(qp['search']));
    if (qp['categoria_id']) this.categoriaId.set(Number(qp['categoria_id']));

    const userAlmacen = this.userStorage.get()?.almacen_id;
    if (userAlmacen) {
      this.almacenId.set(userAlmacen);
    } else if (qp['almacen_id']) {
      this.almacenId.set(Number(qp['almacen_id']));
    }

    this.almacenesSvc.list({ activo: true }).subscribe({
      next: (list) => this.almacenes.set(list),
    });

    this.categoriasSvc.list().subscribe({
      next: (rows: any) => {
        const data = Array.isArray(rows) ? rows : (rows?.data ?? []);
        const mapped = (data ?? [])
          .map((c: any) => ({ id: Number(c.id), descripcion: String(c.descripcion ?? '') }))
          .filter((c: any) => !!c.id && !!c.descripcion);
        mapped.sort((a: any, b: any) => a.descripcion.localeCompare(b.descripcion, 'es'));
        this.categorias.set(mapped);
      },
      error: () => this.categorias.set([]),
    });
  }

  onGridReady(e: GridReadyEvent) {
    this.gridApi = e.api;
    if (this.almacenId() !== null) this.reload();
  }

  reload() {
    const id = this.almacenId();
    if (id === null) return;

    this.banner.set(null);
    this.gridApi?.showLoadingOverlay();

    this.almacenesSvc.inventario(id, false).subscribe({
      next: (items) => {
        this.allRows.set(items);
        items.length ? this.gridApi?.hideOverlay() : this.gridApi?.showNoRowsOverlay();
      },
      error: () => {
        this.gridApi?.hideOverlay();
        this.banner.set({ type: 'danger', text: 'No se pudo cargar el inventario.' });
      },
    });
  }

  onAlmacen(v: string) {
    this.almacenId.set(v ? Number(v) : null);
    this.categoriaId.set('all');
    this.allRows.set([]);
    this.syncQueryParams();
    if (this.almacenId() !== null) this.reload();
  }

  setCategoria(id: number | 'all') {
    if (this.categoriaId() === id) return;
    this.categoriaId.set(id);
    this.syncQueryParams();
  }

  onSearch(v: string) {
    this.search.set(v);
    this.syncQueryParams();
  }

  onCellAction(e: CellClickedEvent<InventarioItem>) {
    if (e.column.getColId() === 'acciones' && e.data) {
      this.openEdit(e.data);
    }
  }

  // ── Modal edición ───────────────────────────────────────────

  openEdit(item: InventarioItem) {
    this.editItem.set(item);
    this.editForm.reset({
      precio:         item.precio         ?? null,
      precio_mayoreo: item.precio_mayoreo ?? null,
      cant_mayoreo:   item.cant_mayoreo   ?? null,
      precio_menudeo: item.precio_menudeo ?? null,
      cant_menudeo:   item.cant_menudeo   ?? null,
      precio_min:     item.precio_min     ?? null,
    });
    this.editModalVisible.set(true);
  }

  closeEdit() {
    this.editModalVisible.set(false);
  }

  saveEdit() {
    if (this.editForm.invalid) return;
    const item = this.editItem();
    if (!item) return;

    const raw = this.editForm.getRawValue();
    this.saving.set(true);

    this.inventarioSvc.updatePrecios(item.id, raw).subscribe({
      next: () => {
        this.saving.set(false);
        this.editModalVisible.set(false);
        this.allRows.update(rows =>
          rows.map(r => r.id === item.id ? { ...r, ...raw } : r)
        );
        this.banner.set({ type: 'success', text: 'Precios actualizados correctamente.' });
      },
      error: (err: any) => {
        this.saving.set(false);
        this.banner.set({
          type: 'danger',
          text: err?.error?.message ?? 'No se pudo actualizar los precios.',
        });
      },
    });
  }

  // ── Plantilla Excel ────────────────────────────────────────

  downloadPlantilla() {
    const almacenDesc = this.almacenes().find(a => a.id === this.almacenId())?.descripcion ?? 'almacen';
    const instrRow = ['NO modificar inventario_id ni articulo_id — se usan para identificar el registro.'];
    const headers = [
      'inventario_id', 'articulo_id', 'articulo', 'variedad', 'unidad',
      'existencia', 'precio', 'precio_mayoreo', 'cant_mayoreo',
      'precio_menudeo', 'cant_menudeo', 'precio_min', 'costo', 'empaque',
    ];
    const dataRows = this.allRows().map(r => [
      r.id,
      r.articulo_id,
      r.articulo?.nombre ?? '',
      r.variedad ?? '',
      r.articulo?.unidad ?? '',
      r.existencia,
      r.precio ?? '',
      r.precio_mayoreo ?? '',
      r.cant_mayoreo ?? '',
      r.precio_menudeo ?? '',
      r.cant_menudeo ?? '',
      r.precio_min ?? '',
      r.costo ?? '',
      r.empaque ?? '',
    ]);

    const ws = XLSX.utils.aoa_to_sheet([instrRow, headers, ...dataRows]);
    ws['!cols'] = [
      { wch: 14 }, { wch: 12 }, { wch: 35 }, { wch: 15 }, { wch: 8 },
      { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 12 },
      { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla_Precios');
    XLSX.writeFile(wb, `plantilla_precios_${almacenDesc}.xlsx`);
  }

  openImportPrecios() {
    this.importInput.nativeElement.value = '';
    this.importInput.nativeElement.click();
  }

  onImportFile(event: any) {
    const file: File | undefined = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
      const ws = wb.Sheets['Plantilla_Precios'];
      if (!ws) {
        this.banner.set({ type: 'danger', text: 'La hoja "Plantilla_Precios" no existe en el archivo.' });
        return;
      }

      const json: any[] = XLSX.utils.sheet_to_json(ws, { defval: '', range: 1 });
      const toNum = (v: any) => (v !== '' && v !== null && v !== undefined) ? Number(v) : null;

      const registros = json
        .filter(r => r.articulo_id)
        .map(r => ({
          inventario_id:  r.inventario_id || null,
          articulo_id:    Number(r.articulo_id),
          precio:         toNum(r.precio),
          precio_mayoreo: toNum(r.precio_mayoreo),
          cant_mayoreo:   toNum(r.cant_mayoreo),
          precio_menudeo: toNum(r.precio_menudeo),
          cant_menudeo:   toNum(r.cant_menudeo),
          precio_min:     toNum(r.precio_min),
          costo:          toNum(r.costo),
          empaque:        toNum(r.empaque),
        }));

      if (!registros.length) {
        this.banner.set({ type: 'danger', text: 'No se encontraron registros válidos en la plantilla.' });
        return;
      }

      this.importing.set(true);
      this.inventarioSvc.importarPrecios({ almacen_id: this.almacenId()!, registros }).subscribe({
        next: (res: any) => {
          this.importing.set(false);
          const n = res?.actualizados ?? registros.length;
          this.banner.set({ type: 'success', text: `Importación completada: ${n} registros procesados.` });
          this.reload();
        },
        error: (err: any) => {
          this.importing.set(false);
          this.banner.set({ type: 'danger', text: err?.error?.message ?? 'Error al importar los precios.' });
        },
      });
    };
    reader.readAsArrayBuffer(file);
  }

  trackByCatId(_: number, c: { id: number }) { return c.id; }

  private syncQueryParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        almacen_id:   this.almacenId() ?? undefined,
        categoria_id: this.categoriaId() === 'all' ? undefined : this.categoriaId(),
        search:       this.search() || undefined,
      },
      replaceUrl: true,
    });
  }
}
