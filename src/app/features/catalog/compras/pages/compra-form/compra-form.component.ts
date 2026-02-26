import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormArray, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';

import { ComprasService } from '../../data/compras.service';
import { Compra, CompraDetalle, CompraStorePayload } from '../../data/compras.models';

import { ProveedoresService } from '../../../proveedores/data/proveedores.service'; // ajusta
import { ArticulosService } from '../../../articulos/data/articulos.service';       // ajusta
import { AlmacenesMinService, AlmacenMini } from '../../data/almacenes-min.service';
import { FormasPagoService, FormaPago } from '../../data/formas-pago.service';

type FieldErrors = Record<string, string[]>;

@Component({
  selector: 'app-compra-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, AgGridAngular, FormsModule],
  templateUrl: './compra-form.component.html',
  styleUrl: './compra-form.component.scss',
})
export class CompraFormComponent {
  loading = signal(false);
  saving = signal(false);
  cancelling = signal(false);

  fieldErrors = signal<FieldErrors>({});

  compraId: number | null = null;
  mode: 'create' | 'view' = 'create';

  compra = signal<Compra | null>(null);

  proveedores = signal<any[]>([]);
  almacenes = signal<AlmacenMini[]>([]);
  formasPago = signal<FormaPago[]>([]);
  articulos = signal<any[]>([]);

  // Grid detalles (solo visual)
  detallesRows = computed(() => this.detalles.controls.map((c) => c.value as any));

  detallesColDefs: ColDef[] = [
    { headerName: 'Artículo', flex: 1, minWidth: 220, valueGetter: (p) => this.articuloNombre(p.data?.articulo_id) },
    { headerName: 'Variedad', field: 'variedad', width: 150 },
    { headerName: 'Cant.', field: 'cantidad', width: 110 },
    { headerName: 'Emp.', field: 'empaque', width: 110 },
    { headerName: 'Costo', field: 'costo', width: 120, valueFormatter: (p) => this.money(p.value) },
    { headerName: 'Imp.', field: 'impuestos', width: 120, valueFormatter: (p) => this.money(p.value) },
    { headerName: 'Precio', field: 'precio', width: 120, valueFormatter: (p) => this.money(p.value) },
    { headerName: 'Precio min', field: 'precio_min', width: 130, valueFormatter: (p) => this.money(p.value) },
    { headerName: 'Subtotal', width: 130, valueGetter: (p) => this.toNumber(p.data?.cantidad) * this.toNumber(p.data?.costo), valueFormatter: (p) => this.money(p.value) },
  ];

  defaultColDef: ColDef = { sortable: true, resizable: true };

  form = this.createForm();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private comprasSvc: ComprasService,
    private proveedoresSvc: ProveedoresService,
    private articulosSvc: ArticulosService,
    private almacenesSvc: AlmacenesMinService,
    private formasPagoSvc: FormasPagoService,
  ) {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.compraId = idParam ? Number(idParam) : null;
    this.mode = this.compraId ? 'view' : 'create';

    this.loadCatalogs();

    if (this.mode === 'view') {
      this.loadCompra();
      this.form.disable();
    } else {
      // defaults
      const today = new Date().toISOString().slice(0, 10);
      this.form.patchValue({ fecha: today, credito: false });
      this.addDetalle();
      this.onCreditoChanged(false);
      this.bindCreditoWatch();
    }
  }

  private createForm() {
    return this.fb.group({
      fecha: ['', [Validators.required]],
      referencia: [''],

      proveedor_id: [null as any, [Validators.required]],
      almacen_id: [null as any, [Validators.required]],

      credito: [false],
      dias_credito: [null as any],
      f_pago_id: [null as any],

      subtotal: [{ value: 0, disabled: true }],
      impuestos: [{ value: 0, disabled: true }],
      total: [{ value: 0, disabled: true }],

      detalles: this.fb.array([]),
    });
  }

  get title(): string {
    return this.mode === 'create' ? 'Nueva compra' : 'Detalle de compra';
  }

  get detalles(): FormArray {
    return this.form.get('detalles') as FormArray;
  }

  private bindCreditoWatch() {
    this.form.get('credito')?.valueChanges.subscribe((v) => this.onCreditoChanged(!!v));
  }

  private onCreditoChanged(isCredito: boolean) {
    const dias = this.form.get('dias_credito');
    const fp = this.form.get('f_pago_id');

    if (isCredito) {
      dias?.setValidators([Validators.required, Validators.min(1)]);
      fp?.clearValidators();
      fp?.setValue(null);
    } else {
      fp?.setValidators([Validators.required]);
      dias?.clearValidators();
      dias?.setValue(null);
    }

    dias?.updateValueAndValidity();
    fp?.updateValueAndValidity();
  }

  private loadCatalogs() {
    this.proveedoresSvc.list({ per_page: 500 }).subscribe({
      next: (res: any) => this.proveedores.set(Array.isArray(res) ? res : (res?.data ?? [])),
      error: () => this.proveedores.set([]),
    });

    this.articulosSvc.list({
      per_page: 1000,
      page: 0
    }).subscribe({
      next: (res: any) => this.articulos.set(Array.isArray(res) ? res : (res?.data ?? [])),
      error: () => this.articulos.set([]),
    });

    this.almacenesSvc.list().subscribe({
      next: (res) => this.almacenes.set(res),
      error: () => this.almacenes.set([]),
    });

    this.formasPagoSvc.list().subscribe({
      next: (res) => this.formasPago.set(res),
      error: () => this.formasPago.set([]),
    });
  }

  private loadCompra() {
    if (!this.compraId) return;
    this.loading.set(true);

    this.comprasSvc.get(this.compraId).subscribe({
      next: (res: any) => {
        const compra = res as Compra;
        this.compra.set(compra);

        // en view, solo mostramos info en la tarjeta + tabla de detalles
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/404');
      },
    });
  }

  addDetalle() {
    const g = this.fb.group({
      articulo_id: [null as any, Validators.required],
      variedad: ['', [Validators.required, Validators.maxLength(50)]],
      cantidad: [1, [Validators.required, Validators.min(0.001)]],
      empaque: [0, [Validators.min(0)]],
      costo: [0, [Validators.required, Validators.min(0)]],
      impuestos: [0, [Validators.min(0)]],
      precio: [0, [Validators.required, Validators.min(0)]],
      precio_min: [0, [Validators.required, Validators.min(0)]],
    });

    g.valueChanges.subscribe(() => this.recalcTotals());

    this.detalles.push(g);
    this.recalcTotals();
  }

  removeDetalle(i: number) {
    if (this.detalles.length <= 1) return;
    this.detalles.removeAt(i);
    this.recalcTotals();
  }

  recalcTotals() {
    const dets = this.detalles.controls.map((c) => c.value as any);

    let subtotal = 0;
    let impuestos = 0;

    for (const d of dets) {
      const cant = this.toNumber(d.cantidad);
      const costo = this.toNumber(d.costo);
      const imp = this.toNumber(d.impuestos);
      subtotal += cant * costo;
      impuestos += imp;
    }

    const total = subtotal + impuestos;

    this.form.patchValue(
      {
        subtotal: this.round2(subtotal),
        impuestos: this.round2(impuestos),
        total: this.round2(total),
      },
      { emitEvent: false },
    );
  }

  submit() {
    if (this.mode !== 'create') return;

    this.fieldErrors.set({});
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.saving.set(true);

    const raw = this.form.getRawValue();

    const payload: CompraStorePayload = {
      fecha: raw.fecha!,
      referencia: raw.referencia?.trim() || null,
      proveedor_id: Number(raw.proveedor_id),
      almacen_id: Number(raw.almacen_id),

      credito: !!raw.credito,
      dias_credito: raw.credito ? Number(raw.dias_credito) : null,
      f_pago_id: raw.credito ? null : Number(raw.f_pago_id),

      subtotal: this.toNumber(raw.subtotal),
      impuestos: this.toNumber(raw.impuestos),
      total: this.toNumber(raw.total),

      detalles: (raw.detalles ?? []).map((d: any) => ({
        articulo_id: Number(d.articulo_id),
        variedad: String(d.variedad ?? '').trim(),
        cantidad: this.toNumber(d.cantidad),
        empaque: this.toNumber(d.empaque),
        costo: this.toNumber(d.costo),
        impuestos: this.toNumber(d.impuestos),
        precio: this.toNumber(d.precio),
        precio_min: this.toNumber(d.precio_min),
      })),
    };

    this.comprasSvc.create(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/catalog/compras'], { queryParams: this.route.snapshot.queryParams });
      },
      error: (err) => {
        this.saving.set(false);

        if (err?.status === 422 && err?.error?.errors) {
          this.fieldErrors.set(err.error.errors as FieldErrors);
          return;
        }

        alert(err?.error?.message ?? 'Ocurrió un error al guardar.');
      },
    });
  }

  cancelarCompra() {
    if (this.mode !== 'view' || !this.compraId) return;
    if (!confirm('¿Seguro que deseas cancelar esta compra?')) return;

    this.cancelling.set(true);

    this.comprasSvc.cancelar(this.compraId).subscribe({
      next: (res) => {
        this.cancelling.set(false);
        alert(res?.message ?? 'Listo.');
        this.loadCompra();
      },
      error: (err) => {
        this.cancelling.set(false);
        alert(err?.error?.message ?? 'No se pudo cancelar.');
      },
    });
  }

  cancel() {
    this.router.navigate(['/catalog/compras'], { queryParams: this.route.snapshot.queryParams });
  }

  // UI helpers
  backendError(path: string): string | null {
    return this.fieldErrors()[path]?.[0] ?? null;
  }

  articuloNombre(id: any): string {
    const nId = Number(id);
    const a = this.articulos().find((x: any) => Number(x.id) === nId);
    return a?.nombre ?? a?.descripcion ?? `#${nId || '-'}`;
  }

  private toNumber(v: any): number {
    const n = typeof v === 'string' ? Number(v) : Number(v ?? 0);
    return Number.isFinite(n) ? n : 0;
  }

  private round2(n: number): number {
    return Math.round(n * 100) / 100;
  }

  private money(v: any): string {
    const n = this.toNumber(v);
    return n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}