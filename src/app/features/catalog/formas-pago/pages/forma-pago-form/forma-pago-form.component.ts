import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { FormasPagoService } from '../../data/formas-pago.service';
import { FormaPago } from '../../data/formas-pago.models';

type FieldErrors = Record<string, string[]>;

@Component({
  selector: 'app-forma-pago-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './forma-pago-form.component.html',
  styleUrl: './forma-pago-form.component.scss',
})
export class FormaPagoFormComponent {
  loading = signal(false);
  saving = signal(false);

  formaId: number | null = null;
  mode: 'create' | 'edit' = 'create';

  fieldErrors = signal<FieldErrors>({});

  form = this.fb.group({
    descripcion: ['', [Validators.required, Validators.maxLength(255)]],
    activo: [true],
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private svc: FormasPagoService,
  ) {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.formaId = idParam ? Number(idParam) : null;
    this.mode = this.formaId ? 'edit' : 'create';

    if (this.mode === 'edit') this.loadFromListCacheOrReload();
  }

  get title(): string {
    return this.mode === 'create' ? 'Nueva forma de pago' : 'Editar forma de pago';
  }

  /**
   * Backend NO tiene show().
   * Para editar, cargamos todo el listado y buscamos por id.
   * (Si luego agregas GET /formas-pago/{id}, lo cambiamos a get(id) directo.)
   */
  private loadFromListCacheOrReload() {
    if (!this.formaId) return;

    this.loading.set(true);
    this.svc.list().subscribe({
      next: (rows) => {
        const item = (rows ?? []).find((x) => x.id === this.formaId);

        if (!item) {
          this.loading.set(false);
          this.router.navigateByUrl('/404');
          return;
        }

        this.form.patchValue({
          descripcion: item.descripcion ?? '',
          activo: !!item.activo,
        });

        this.fieldErrors.set({});
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/404');
      },
    });
  }

  // Validaciones
  errorText(field: string): string | null {
    const c = this.form.get(field);
    if (!c || !c.touched || !c.errors) return null;

    if (c.errors['required']) return 'Este campo es requerido.';
    if (c.errors['maxlength']) return 'Excede la longitud máxima.';
    return 'Campo inválido.';
  }

  backendError(field: string): string | null {
    return this.fieldErrors()[field]?.[0] ?? null;
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    const backend = !!this.fieldErrors()[field]?.length;
    return (!!c && c.touched && c.invalid) || backend;
  }

  clearBackendError(field: string) {
    const errs = { ...this.fieldErrors() };
    if (errs[field]) {
      delete errs[field];
      this.fieldErrors.set(errs);
    }
  }

  // Acciones
  submit() {
    this.fieldErrors.set({});
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.saving.set(true);

    const raw = this.form.getRawValue();
    const payload: Partial<FormaPago> = {
      descripcion: (raw.descripcion ?? '').trim(),
      activo: !!raw.activo,
    };

    const req =
      this.mode === 'create'
        ? this.svc.create(payload)
        : this.svc.update(this.formaId!, payload);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/catalog/formas-pago'], {
          queryParams: this.route.snapshot.queryParams,
        });
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

  cancel() {
    this.router.navigate(['/catalog/formas-pago'], {
      queryParams: this.route.snapshot.queryParams,
    });
  }
}