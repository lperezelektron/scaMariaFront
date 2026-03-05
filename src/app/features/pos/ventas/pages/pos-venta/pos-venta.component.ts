import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  private precioDraft = new Map<string, string>();
  private cantidadDraft = new Map<string, string>();

  // UI
  loadingLotes = signal(false);
  saving = signal(false);
  showLotesModal = signal(false);
  showCheckout = signal(true);

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
  gridPerPage = signal(50); // aumentado para cargar más items por request
  gridLastPage = signal(1);
  gridTotal = signal(0);
  gridLoading = signal(false);
  gridLoadingMore = signal(false);

  private gridSearch$ = new Subject<string>();

  // Lotes
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

  // Signal para forzar re-evaluación de canSubmit
  private formTouched = signal(0);

  // Totales (optimizados)
  subtotal = computed(() => {
    const cart = this.cart();
    let sum = 0;
    for (let i = 0; i < cart.length; i++) {
      sum += cart[i].cantidad * cart[i].precio;
    }
    return sum;
  });
  
  impuestos = computed(() => {
    const cart = this.cart();
    let sum = 0;
    for (let i = 0; i < cart.length; i++) {
      sum += cart[i].impuestos ?? 0;
    }
    return sum;
  });
  
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
    // Incluir formTouched para forzar re-evaluación
    this.formTouched();
    
    // Early returns para evitar cálculos innecesarios
    if (this.saving()) return false;
    
    const cartLength = this.cart().length;
    if (cartLength === 0) return false;
    
    if (this.form.invalid) return false;

    const credito = this.form.value.credito;
    const diasCredito = this.form.value.dias_credito;
    if (credito && (!diasCredito || diasCredito <= 0)) return false;

    // Validación de líneas del carrito (optimizada)
    const cart = this.cart();
    for (let i = 0; i < cartLength; i++) {
      const line = cart[i];
      const cantidad = line.cantidad;
      const existencia = +line.lote.existencia || 0;
      const precioMin = +line.lote.precio_min || 0;
      
      if (cantidad <= 0 || cantidad > existencia || line.precio < precioMin) {
        return false;
      }
    }

    return true;
  });

  confirmOpen = signal(false);
  confirmTitle = signal('Confirmar acción');
  confirmMessage = signal('');
  confirmSub = signal<string | null>(null);
  confirmAcceptText = signal('Eliminar');

  private pendingConfirmAction: (() => void) | null = null;

  constructor() {
    this.loadCatalogos();

    // Forzar re-evaluación de canSubmit cuando cambie el form
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.formTouched.update(v => v + 1);
      });

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
      .pipe(debounceTime(150), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((q) => this.searchClientes(q));

    // búsqueda live artículos
    this.gridSearch$
      .pipe(debounceTime(150), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
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
      error: () => {
        // silencioso, no bloquear el POS
      }
    });

    // formas pago
    this.formasPagoSvc.list().subscribe({
      next: (rows) => this.formasPago.set(rows ?? []),
      error: () => {
        // silencioso
      }
    });

    // categorías (con manejo de errores mejorado)
    this.categoriasSvc.list?.().subscribe?.({
      next: (rows: any) => {
        const data = Array.isArray(rows) ? rows : (rows?.data ?? []);
        const mapped = (data ?? [])
          .map((c: any) => ({ 
            id: Number(c.id), 
            descripcion: String(c.descripcion ?? c.nombre ?? '') 
          }))
          .filter((c: any) => !!c.id && !!c.descripcion);
        
        mapped.sort((a: any, b: any) => a.descripcion.localeCompare(b.descripcion, 'es'));
        this.categorias.set(mapped);
      },
      error: () => {
        this.categorias.set([]);
      },
    });
  }

  // ====== Catálogo Artículos (infinite) ======
  onGridSearch(v: string) {
    this.gridSearch$.next(v);
  }

  setCategoria(id: number | 'all') {
    if (this.categoriaId() === id) return; // evitar reset si es la misma categoría
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

    // threshold más agresivo para cargar antes
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 100;
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
    this.showLotesModal.set(true);
    
    // Cargar lotes inmediatamente sin esperar
    this.loadLotes(a.id);
  }

  closeLotesModal() {
    this.showLotesModal.set(false);
  }

  selectLote(l: LoteDisponible) {
    this.addLote(l);
    this.closeLotesModal();
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
        variedad: null, // Ya no usamos búsqueda de variedad
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

    this.clientesSvc.list({ search: s, per_page: 8, page: 1, activo: true }).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        this.clientesFound.set(data);
      },
      error: () => {
        // silencioso, no mostrar error en búsqueda
        this.clientesFound.set([]);
      }
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
    const line = this.cart().find((x) => x.key === key);
    if (!line) return;

    const nombre = line?.lote?.articulo?.nombre ?? 'este artículo';

    this.openConfirm({
      title: 'Eliminar artículo',
      message: `¿Seguro que quieres eliminar "${nombre}" del ticket?`,
      sub: 'Esta acción no se puede deshacer.',
      acceptText: 'Eliminar',
      onAccept: () => {
        this.cart.set(this.cart().filter((x) => x.key !== key));
        this.cantidadDraft.delete(key);
        this.precioDraft.delete(key);
      },
    });
  }

  bumpQty(key: string, delta: number) {
    const line = this.cart().find((x) => x.key === key);
    if (!line) return;

    const current = Number(line.cantidad) || 0;
    const next = current + delta;

    if (next <= 0) {
      const nombre = line?.lote?.articulo?.nombre ?? 'este artículo';

      this.openConfirm({
        title: 'Eliminar artículo',
        message: `La cantidad quedará en 0. ¿Quieres eliminar "${nombre}" del ticket?`,
        sub: 'También puedes cancelar y ajustar la cantidad manualmente.',
        acceptText: 'Eliminar',
        onAccept: () => {
          this.cart.set(this.cart().filter((x) => x.key !== key));
        },
      });

      return;
    }

    this.cart.set(
      this.cart().map((x) => (x.key === key ? { ...x, cantidad: this.round2(next) } : x)),
    );
  }

  private maxStock(line: CartLine): number {
    return +line.lote.existencia || 0;
  }

  isOverStock(line: CartLine): boolean {
    return line.cantidad > (+line.lote.existencia || 0);
  }

  isBelowMinPrice(line: CartLine): boolean {
    return line.precio < (+line.lote.precio_min || 0);
  }

  setQty(key: string, raw: any) {
    const line = this.cart().find((x) => x.key === key);
    if (!line) return;

    const s = String(raw ?? '');
    
    // Guardamos el draft
    this.cantidadDraft.set(key, s);

    // Intentamos parsear
    const normalized = s.replace(',', '.').trim();

    // Estados intermedios
    if (
      normalized === '' ||
      normalized === '.' ||
      normalized === '-' ||
      normalized === '-.' ||
      normalized.endsWith('.')
    ) {
      return;
    }

    const n = Number(normalized);
    if (!Number.isFinite(n)) return;

    if (n <= 0) {
      const nombre = line?.lote?.articulo?.nombre ?? 'este artículo';

      this.openConfirm({
        title: 'Eliminar artículo',
        message: `La cantidad quedará en 0. ¿Quieres eliminar "${nombre}" del ticket?`,
        sub: 'Si cancelas, no se aplicará el cambio.',
        acceptText: 'Eliminar',
        onAccept: () => {
          this.cart.set(this.cart().filter((x) => x.key !== key));
          this.cantidadDraft.delete(key);
        },
      });

      return;
    }

    const safe = Math.max(0, n);
    
    // Solo actualizar si cambió
    if (line.cantidad !== safe) {
      this.cart.set(
        this.cart().map((x) => (x.key === key ? { ...x, cantidad: safe } : x)),
      );
    }
  }

  commitQty(key: string) {
    const line = this.cart().find((x) => x.key === key);
    if (!line) return;

    const draft = this.cantidadDraft.get(key);
    if (draft === undefined) {
      this.cart.set(this.cart().map((x) => (x.key === key ? { ...x, cantidad: this.round2(Math.max(0, +x.cantidad || 0)) } : x)));
      return;
    }

    const normalized = draft.replace(',', '.').trim();
    const n = Number(normalized);

    if (!Number.isFinite(n)) {
      this.cantidadDraft.delete(key);
      return;
    }

    const final = this.round2(Math.max(0.01, n));

    this.cantidadDraft.delete(key);

    if (line.cantidad !== final) {
      this.cart.set(
        this.cart().map((x) => (x.key === key ? { ...x, cantidad: final } : x)),
      );
    }
  }

  cantidadView(key: string, fallback: number) {
    const d = this.cantidadDraft.get(key);
    return d !== undefined ? d : String(fallback ?? 0);
  }

  setPrecio(key: string, raw: any) {
    const line = this.cart().find((x) => x.key === key);
    if (!line) return;

    const s = String(raw ?? '');

    // guardamos lo que el usuario está tecleando, tal cual
    this.precioDraft.set(key, s);

    // Intentamos parsear SIN forzar formato (sin round2) para no brincar el cursor.
    // Permitimos estados intermedios como: "", ".", "20.", "20,", "-".
    const normalized = s.replace(',', '.').trim();

    // Si está vacío o es un estado incompleto, no actualizamos el número todavía.
    if (
      normalized === '' ||
      normalized === '.' ||
      normalized === '-' ||
      normalized === '-.' ||
      normalized.endsWith('.')
    ) {
      return;
    }

    const p = Number(normalized);
    if (!Number.isFinite(p)) return;

    const safe = Math.max(0, p);

    // Actualiza el precio numérico SIN redondear (para no “formatear” mientras escribe)
    this.cart.set(
      this.cart().map((x) => (x.key === key ? { ...x, precio: safe } : x)),
    );
  }

  commitPrecio(key: string) {
    const line = this.cart().find((x) => x.key === key);
    if (!line) return;

    const draft = this.precioDraft.get(key);
    // si no hay draft, igual aseguramos round2 al valor actual
    if (draft === undefined) {
      this.cart.set(this.cart().map((x) => (x.key === key ? { ...x, precio: this.round2(Math.max(0, +x.precio || 0)) } : x)));
      return;
    }

    const normalized = draft.replace(',', '.').trim();
    const p = Number(normalized);

    if (!Number.isFinite(p)) {
      // si quedó algo raro, regresamos al valor numérico actual
      this.precioDraft.delete(key);
      return;
    }

    const final = this.round2(Math.max(0, p));

    this.precioDraft.delete(key);

    this.cart.set(
      this.cart().map((x) => (x.key === key ? { ...x, precio: final } : x)),
    );
  }

  precioView(key: string, fallback: number) {
    const d = this.precioDraft.get(key);
    return d !== undefined ? d : String(fallback ?? 0);
  }

  // TrackBy para evitar re-render completo del ngFor
  trackByKey(index: number, item: CartLine): string {
    return item.key;
  }

  trackByArticuloId(index: number, item: any): number {
    return item.id;
  }

  trackByLoteId(index: number, item: LoteDisponible): number {
    return item.id;
  }

  trackByCategoriaId(index: number, item: any): number {
    return item.id;
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

  openConfirm(opts: {
    title?: string;
    message: string;
    sub?: string | null;
    acceptText?: string;
    onAccept: () => void;
  }) {
    this.confirmTitle.set(opts.title ?? 'Confirmar acción');
    this.confirmMessage.set(opts.message);
    this.confirmSub.set(opts.sub ?? null);
    this.confirmAcceptText.set(opts.acceptText ?? 'Aceptar');
    this.pendingConfirmAction = opts.onAccept;
    this.confirmOpen.set(true);
  }

  cancelConfirm() {
    this.pendingConfirmAction = null;
    this.confirmOpen.set(false);
  }

  acceptConfirm() {
    const action = this.pendingConfirmAction;
    this.pendingConfirmAction = null;
    this.confirmOpen.set(false);
    action?.();
  }
}