import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ArticulosService } from '../../../../catalog/articulos/data/articulos.service';
import { CategoriasService } from '../../../../catalog/articulos/data/categorias.service';

import { ClientesService } from '../../../../catalog/clientes/data/clientes.service';
import { FormasPagoService } from '../../../../catalog/formas-pago/data/formas-pago.service';
import { AlmacenesService } from '../../../../settings/pages/almacenes/data/almacenes.service';
import { LoteDisponible, VentaDetallePayload, VentaStorePayload } from '../../data/ventas.models';
import { VentasService } from '../../data/ventas.service';

type FieldErrors = Record<string, string[]>;

type CartLine = {
  key: string; // lote_id
  lote: LoteDisponible;

  articulo_id: number;
  lote_id: number;

  cantidad: number;
  precio: number;
  impuestos: number; // por ahora 0
};

@Component({
  selector: 'app-pos-venta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pos-venta.component.html',
  styleUrl: './pos-venta.component.scss',
})
export class PosVentaComponent {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  private ventasSvc = inject(VentasService);
  private articulosSvc = inject(ArticulosService);
  private categoriasSvc = inject(CategoriasService);

  private clientesSvc = inject(ClientesService);
  private formasPagoSvc = inject(FormasPagoService);
  private almacenesSvc = inject(AlmacenesService);

  // UI
  loadingLotes = signal(false);
  saving = signal(false);

  banner = signal<{ type: 'success' | 'danger' | 'info'; text: string } | null>(null);
  fieldErrors = signal<FieldErrors>({});

  // Catálogos
  almacenes = signal<any[]>([]);
  formasPago = signal<any[]>([]);
  categorias = signal<{ id: number; descripcion: string }[]>([]);

  // Selecciones (solo UI)
  selectedArticulo = signal<any | null>(null);

  // Búsqueda clientes
  clienteSearch = signal('');
  clientesFound = signal<any[]>([]);
  private clienteSearch$ = new Subject<string>();

  // Catálogo visual artículos (infinite)
  articuloSearch = signal('');
  categoriaId = signal<number | 'all'>('all');

  gridItems = signal<any[]>([]);
  gridPage = signal(1);
  gridPerPage = signal(30); // carga por lotes, tablet-friendly
  gridLastPage = signal(1);
  gridTotal = signal(0);
  gridLoading = signal(false);
  gridLoadingMore = signal(false);

  private gridSearch$ = new Subject<string>();

  // Lotes
  variedadSearch = signal('');
  lotes = signal<LoteDisponible[]>([]);

  // Ticket
  cart = signal<CartLine[]>([]);

  // Form
  form = this.fb.group({
    fecha: [this.today(), [Validators.required]],
    almacen_id: [null as number | null, [Validators.required]],
    cliente_id: [null as number | null, [Validators.required]],
    f_pago_id: [null as number | null, [Validators.required]],
    credito: [false],
    dias_credito: [null as number | null],
  });

  // Totales
  subtotal = computed(() => this.cart().reduce((acc, x) => acc + x.cantidad * x.precio, 0));
  impuestos = computed(() => this.cart().reduce((acc, x) => acc + (x.impuestos ?? 0), 0));
  total = computed(() => this.subtotal() + this.impuestos());

  linesCount = computed(() => this.cart().length);

  selectedAlmacenName = computed(() => {
    const id = this.form.value.almacen_id;
    if (!id) return '—';
    const a = this.almacenes().find(x => x.id === id);
    return a?.nombre ?? '—';
  });

  selectedPagoName = computed(() => {
    const id = this.form.value.f_pago_id;
    if (!id) return '—';
    const f = this.formasPago().find(x => x.id === id);
    return f?.descripcion ?? '—';
  });

  selectedClienteName = computed(() => {
    const id = this.form.value.cliente_id;
    if (!id) return '—';
    const hit = this.clientesFound().find(x => x.id === id);
    // si ya seleccionaste y limpiamos lista, al menos mostramos el texto escrito
    return hit?.nombre ?? (this.clienteSearch()?.trim() || '—');
  });

  canSubmit = computed(() => {
    if (this.saving()) return false;
    if (this.cart().length === 0) return false;
    if (this.form.invalid) return false;

    const credito = !!this.form.value.credito;
    if (credito && !(this.form.value.dias_credito && this.form.value.dias_credito > 0)) return false;

    // reglas POS
    const invalidLine = this.cart().some(line =>
      line.cantidad <= 0 ||
      line.cantidad > this.toNumber(line.lote.existencia) ||
      line.precio < this.toNumber(line.lote.precio_min)
    );

    return !invalidLine;
  });

  constructor() {
    this.loadCatalogos();

    // crédito -> requiere días
    this.form.controls.credito.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((isCredito) => {
        if (isCredito) {
          this.form.controls.dias_credito.setValidators([Validators.required, Validators.min(1)]);
        } else {
          this.form.controls.dias_credito.clearValidators();
          this.form.controls.dias_credito.setValue(null);
        }
        this.form.controls.dias_credito.updateValueAndValidity();
      });

    // búsqueda live clientes
    this.clienteSearch$
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((q) => this.searchClientes(q));

    // búsqueda live artículos
    this.gridSearch$
      .pipe(debounceTime(200), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((q) => {
        this.articuloSearch.set(q);
        this.resetGridAndLoad();
      });

    // si cambia almacén: limpiar lotes y selección (evitar mezcla)
    this.form.controls.almacen_id.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.lotes.set([]);
        this.selectedArticulo.set(null);
      });

    // carga inicial grid
    this.resetGridAndLoad();
  }

  // ====== Inicial ======
  private today(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private loadCatalogos() {
    // almacenes
    this.almacenesSvc.list({ activo: true }).subscribe({
      next: (rows) => {
        this.almacenes.set(rows ?? []);
        if ((rows ?? []).length === 1 && !this.form.value.almacen_id) {
          this.form.patchValue({ almacen_id: rows[0].id });
        }
      },
    });

    // formas pago
    this.formasPagoSvc.list().subscribe({
      next: (rows) => this.formasPago.set(rows ?? []),
    });

    // ✅ categorías reales (arregla tu bug)
    // asumo que categoriasSvc.list() existe (como en Artículos)
    this.categoriasSvc.list?.().subscribe?.({
      next: (rows: any) => {
        const data = Array.isArray(rows) ? rows : (rows?.data ?? []);
        const mapped = (data ?? []).map((c: any) => ({ id: Number(c.id), descripcion: String(c.descripcion ?? c.nombre ?? '') }))
          .filter((c: any) => !!c.id && !!c.descripcion);
        mapped.sort((a: any, b: any) => a.descripcion.localeCompare(b.descripcion, 'es'));
        this.categorias.set(mapped);
      },
      error: () => {
        // si falla, no rompemos el POS: solo no habrá chips
        this.categorias.set([]);
      },
    });
  }

  // ====== Catálogo Artículos (infinite) ======
  onGridSearch(v: string) {
    this.gridSearch$.next(v);
  }

  setCategoria(id: number | 'all') {
    this.categoriaId.set(id);
    this.resetGridAndLoad();
  }

  resetGridAndLoad() {
    this.gridItems.set([]);
    this.gridPage.set(1);
    this.gridLastPage.set(1);
    this.gridTotal.set(0);
    this.fetchGridPage(1, false);
  }

  fetchGridPage(page: number, append: boolean) {
    const search = (this.articuloSearch() ?? '').trim();
    const cat = this.categoriaId();

    const categoria_id =
      cat === 'all' ? null : (Number.isFinite(Number(cat)) ? Number(cat) : null);

    if (!append) this.gridLoading.set(true);
    else this.gridLoadingMore.set(true);

    this.articulosSvc
      .list({
        page,
        per_page: this.gridPerPage(),
        search: search || undefined,
        categoria_id: categoria_id,
        activo: true,
      })
      .subscribe({
        next: (res: any) => {
          const data = res?.data ?? [];
          const last = Number(res?.last_page ?? 1);
          const total = Number(res?.total ?? data.length ?? 0);

          this.gridLastPage.set(last);
          this.gridTotal.set(total);
          this.gridPage.set(Number(res?.current_page ?? page));

          const merged = append ? [...this.gridItems(), ...data] : data;
          this.gridItems.set(merged);

          this.gridLoading.set(false);
          this.gridLoadingMore.set(false);
        },
        error: () => {
          this.gridLoading.set(false);
          this.gridLoadingMore.set(false);
          this.banner.set({ type: 'danger', text: 'No se pudo cargar el catálogo de artículos.' });
        },
      });
  }

  onGridScroll(ev: Event) {
    const el = ev.target as HTMLElement;
    if (!el) return;

    // threshold
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 180;
    if (!nearBottom) return;

    if (this.gridLoading() || this.gridLoadingMore()) return;

    const page = this.gridPage();
    const last = this.gridLastPage();

    if (page >= last) return;

    this.fetchGridPage(page + 1, true);
  }

  imgSrc(a: any): string {
    return a?.imagen || '../../../../../../assets/images/picture.png';
  }

  selectArticulo(a: any) {
    const almacenId = this.form.value.almacen_id;
    if (!almacenId) {
      this.banner.set({ type: 'info', text: 'Selecciona un almacén antes de elegir artículos.' });
      return;
    }

    this.banner.set(null);
    this.selectedArticulo.set(a);
    this.loadLotes(a.id);
  }

  refreshLotes() {
    const art = this.selectedArticulo();
    if (!art?.id) return;
    this.loadLotes(art.id);
  }

  private loadLotes(articuloId: number) {
    const almacenId = this.form.value.almacen_id;
    if (!almacenId) return;

    this.loadingLotes.set(true);

    this.ventasSvc
      .lotesDisponibles({
        almacen_id: almacenId,
        articulo_id: articuloId,
        variedad: this.variedadSearch() || null,
      })
      .subscribe({
        next: (rows) => {
          this.lotes.set(rows ?? []);
          this.loadingLotes.set(false);
        },
        error: (err) => {
          this.loadingLotes.set(false);
          this.banner.set({
            type: 'danger',
            text: err?.error?.message ?? 'No se pudieron cargar los lotes.',
          });
        },
      });
  }

  // ====== Clientes ======
  onClienteSearch(v: string) {
    this.clienteSearch.set(v);
    this.clienteSearch$.next(v);
  }

  private searchClientes(q: string) {
    const s = (q ?? '').trim();
    if (s.length < 2) {
      this.clientesFound.set([]);
      return;
    }

    this.clientesSvc.list({ search: s, per_page: 10, page: 1, activo: true }).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        this.clientesFound.set(data);
      },
    });
  }

  selectCliente(c: any) {
    this.form.patchValue({ cliente_id: c.id });
    this.clienteSearch.set(c.nombre ?? '');
    this.clientesFound.set([]);
    this.clearBackendError('cliente_id');
  }

  // ====== Ticket ======
  addLote(l: LoteDisponible) {
    const key = String(l.id);
    const existing = this.cart().find((x) => x.key === key);

    const precio = this.toNumber(l.precio);

    if (existing) {
      this.setQty(key, existing.cantidad + 1);
      return;
    }

    const line: CartLine = {
      key,
      lote: l,
      articulo_id: l.articulo_id,
      lote_id: l.id,
      cantidad: 1,
      precio,
      impuestos: 0,
    };

    this.cart.set([line, ...this.cart()]);
  }

  removeLine(key: string) {
    this.cart.set(this.cart().filter((x) => x.key !== key));
  }

  bumpQty(key: string, delta: number) {
    const line = this.cart().find((x) => x.key === key);
    if (!line) return;
    this.setQty(key, line.cantidad + delta);
  }

  private maxStock(line: CartLine): number {
    return this.toNumber(line.lote.existencia);
  }

  isOverStock(line: CartLine): boolean {
    return line.cantidad > this.maxStock(line);
  }

  isBelowMinPrice(line: CartLine): boolean {
    const min = this.toNumber(line.lote.precio_min);
    return line.precio < min;
  }

  setQty(key: string, raw: any) {
    const line = this.cart().find((x) => x.key === key);
    if (!line) return;

    let qty = Math.max(0, this.toNumber(raw));

    const max = this.maxStock(line);
    if (qty > max) qty = max;

    const next = this.cart()
      .map((x) => (x.key === key ? { ...x, cantidad: qty } : x))
      .filter((x) => x.cantidad > 0);

    this.cart.set(next);
  }

  setPrecio(key: string, raw: any) {
    const line = this.cart().find((x) => x.key === key);
    if (!line) return;

    let p = Math.max(0, this.toNumber(raw));

    const min = this.toNumber(line.lote.precio_min);
    if (p < min) p = min;

    this.cart.set(this.cart().map((x) => (x.key === key ? { ...x, precio: p } : x)));
  }

  // ====== Guardar ======
  submitVenta() {
    this.banner.set(null);
    this.fieldErrors.set({});
    this.form.markAllAsTouched();

    if (!this.canSubmit()) return;

    const raw = this.form.getRawValue();

    const detalles: VentaDetallePayload[] = this.cart().map((x) => ({
      articulo_id: x.articulo_id,
      lote_id: x.lote_id,
      cantidad: x.cantidad,
      empaque: 0,
      precio: x.precio,
      impuestos: 0,
    }));

    const payload: VentaStorePayload = {
      fecha: raw.fecha!,
      cliente_id: raw.cliente_id!,
      almacen_id: raw.almacen_id!,
      f_pago_id: raw.f_pago_id!,
      credito: !!raw.credito,
      dias_credito: raw.credito ? (raw.dias_credito ?? undefined) : undefined,
      subtotal: this.round2(this.subtotal()),
      impuestos: 0,
      total: this.round2(this.total()),
      detalles,
    };

    this.saving.set(true);

    this.ventasSvc.store(payload).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.banner.set({ type: 'success', text: res?.message ?? 'Venta registrada.' });

        // reset conservando almacén/pago
        const keepAlmacen = raw.almacen_id;
        const keepPago = raw.f_pago_id;

        this.cart.set([]);
        this.lotes.set([]);
        this.variedadSearch.set('');
        this.selectedArticulo.set(null);

        this.clienteSearch.set('');
        this.clientesFound.set([]);

        this.form.reset({
          fecha: this.today(),
          almacen_id: keepAlmacen,
          cliente_id: null,
          f_pago_id: keepPago,
          credito: false,
          dias_credito: null,
        });
      },
      error: (err) => {
        this.saving.set(false);

        if (err?.status === 422) {
          this.banner.set({ type: 'danger', text: err?.error?.message ?? 'Revisa los datos.' });
          if (err?.error?.errors) this.fieldErrors.set(err.error.errors as FieldErrors);
          return;
        }

        this.banner.set({ type: 'danger', text: err?.error?.message ?? 'Error al registrar la venta.' });
      },
    });
  }

  // ====== Helpers ======
  money(n: number): string {
    return n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private toNumber(v: any): number {
    const n = typeof v === 'string' ? Number(v) : Number(v ?? 0);
    return Number.isFinite(n) ? n : 0;
  }

  private round2(v: number): number {
    return Math.round(v * 100) / 100;
  }

  backendError(field: string): string | null {
    return this.fieldErrors()[field]?.[0] ?? null;
  }

  clearBackendError(field: string) {
    const errs = { ...this.fieldErrors() };
    if (errs[field]) {
      delete errs[field];
      this.fieldErrors.set(errs);
    }
  }
}