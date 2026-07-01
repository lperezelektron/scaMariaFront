import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center p-4">
      <div class="text-center">
        <h1 class="display-4 mb-2">403</h1>
        <p class="lead mb-4">No tienes permisos para acceder a esta sección.</p>

        <div class="d-flex gap-2 justify-content-center">
          <a class="btn btn-primary" routerLink="/dashboard">Ir al Dashboard</a>
          <a class="btn btn-outline-secondary" routerLink="/login">Iniciar sesión</a>
        </div>
      </div>
    </div>
  `,
})
export class Page403Component {

}
