import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { EmpleadosService } from '../../data/empleados.service';
import { Empleado } from '../../data/empleados.models';

type FieldErrors = Record<string, string[]>;

@Component({
  selector: 'app-empleado-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './empleado-form.component.html',
  styleUrl: './empleado-form.component.scss',
})
export class EmpleadoFormComponent {
  loading = signal(false);
  saving = signal(false);

  empleadoId: number | null = null;
  mode: 'create' | 'edit' = 'create';

  fieldErrors = signal<FieldErrors>({});

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    activo: [true],
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private svc: EmpleadosService,
  ) {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.empleadoId = idParam ? Number(idParam) : null;
    this.mode = this.empleadoId ? 'edit' : 'create';

    if (this.mode === 'edit') this.loadEmpleado();
  }

  get title(): string {
    return this.mode === 'create' ? 'Nuevo empleado' : 'Editar empleado';
  }

  private loadEmpleado() {
    if (!this.empleadoId) return;

    this.loading.set(true);
    this.svc.get(this.empleadoId).subscribe({
      next: (res) => {
        const item = res.empleado;
        this.form.patchValue({ nombre: item.nombre ?? '', activo: !!item.activo });
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
    return (!!c && c.touched && c.invalid) || backend;
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
    const payload: Partial<Empleado> = {
      nombre: (raw.nombre ?? '').trim(),
      activo: !!raw.activo,
    };

    const req =
      this.mode === 'create'
        ? this.svc.create(payload)
        : this.svc.update(this.empleadoId!, payload);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/catalog/empleados'], {
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
    this.router.navigate(['/catalog/empleados'], {
      queryParams: this.route.snapshot.queryParams,
    });
  }
}
