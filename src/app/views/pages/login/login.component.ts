import { Component } from '@angular/core';
import { NgIf, NgStyle } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { IconDirective } from '@coreui/icons-angular';
import {
  ContainerComponent,
  RowComponent,
  ColComponent,
  CardGroupComponent,
  CardComponent,
  CardBodyComponent,
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  FormControlDirective,
  ButtonDirective,
  AlertComponent,
  SpinnerComponent
} from '@coreui/angular';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    // Angular
    NgIf,
    ReactiveFormsModule,
    RouterLink,
    NgStyle,

    // CoreUI
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardGroupComponent,
    CardComponent,
    CardBodyComponent,
    FormDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    IconDirective,
    FormControlDirective,
    ButtonDirective,
    AlertComponent,
    SpinnerComponent,
  ],
})
export class LoginComponent {
  loading = false;
  errorMsg = '';
  sessionExpired = false;
  form: any;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.sessionExpired = this.route.snapshot.queryParamMap.get('expired') === 'true';
    if (this.sessionExpired) {
      setTimeout(() => (this.sessionExpired = false), 5000);
    }
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  submit(): void {
    this.errorMsg = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { email, password } = this.form.getRawValue();

    this.auth.login(email!, password!).subscribe({
      next: () => {
        this.loading = false;
        // Decide a dónde mandar al usuario al loguearse:
        this.router.navigateByUrl('/dashboard'); // o '/pos'
      },
      error: (err) => {
        this.loading = false;

        // Laravel típicamente responde 401/422 con mensaje
        const msg =
          err?.error?.message ??
          (err?.status === 401 ? 'Credenciales inválidas' : null) ??
          'No se pudo iniciar sesión';

        this.errorMsg = msg;
      },
    });
  }
}