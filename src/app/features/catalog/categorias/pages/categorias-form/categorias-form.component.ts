import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { CategoriasService } from '../../data/categorias.service';

type FieldErrors = Record<string, string[]>;

@Component({
  selector: 'app-categorias-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './categorias-form.component.html',
  styleUrl: './categorias-form.component.scss',
})
export class CategoriasFormComponent {
  loading = signal(false);
  saving = signal(false);

  categoriaId: number | null = null;
  mode: 'create' | 'edit' = 'create';

  fieldErrors = signal<FieldErrors>({});

  form = this.fb.group({
    descripcion: ['', [Validators.required, Validators.maxLength(50)]],
    activo: [true],
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private categoriasSvc: CategoriasService,
  ) {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.categoriaId = idParam ? Number(idParam) : null;
    this.mode = this.categoriaId ? 'edit' : 'create';

    if (this.mode === 'edit') this.loadCategoria();
  }

  get title(): string {
    return this.mode === 'create' ? 'Nueva categoría' : 'Editar categoría';
  }

  private loadCategoria() {
    if (!this.categoriaId) return;
    this.loading.set(true);

    this.categoriasSvc.get(this.categoriaId).subscribe({
      next: (res: any) => {
        const c = res?.categoria ?? res;

        this.form.patchValue({
          descripcion: c?.descripcion ?? '',
          activo: !!c?.activo,
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
    return ((!!c && c.touched && c.invalid) || backend);
  }

  clearBackendError(field: string) {
    const errs = { ...this.fieldErrors() };
    if (errs[field]) {
      delete errs[field];
      this.fieldErrors.set(errs);
    }
  }

  submit() {
    this.fieldErrors.set({});
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.saving.set(true);

    const raw = this.form.getRawValue();
    const payload = {
      descripcion: (raw.descripcion ?? '').trim(),
      activo: !!raw.activo,
    };

    const req =
      this.mode === 'create'
        ? this.categoriasSvc.create(payload)
        : this.categoriasSvc.update(this.categoriaId!, payload);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/catalog/categorias'], { queryParams: this.route.snapshot.queryParams });
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
    this.router.navigate(['/catalog/categorias'], { queryParams: this.route.snapshot.queryParams });
  }
}