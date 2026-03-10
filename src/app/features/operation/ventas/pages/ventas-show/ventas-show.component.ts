import { CommonModule } from '@angular/common';
import { Component, signal, inject, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonDirective, SpinnerComponent } from '@coreui/angular';

import { VentasListService } from '../../data/ventas-list.service';
import { VentaShow } from '../../data/ventas-list.models';

@Component({
  selector: 'app-ventas-show',
  standalone: true,
  imports: [CommonModule, ButtonDirective, SpinnerComponent],
  templateUrl: './ventas-show.component.html',
  styleUrl: './ventas-show.component.scss',
})
export class VentasShowComponent implements AfterViewInit {
  private ventasSvc = inject(VentasListService);
  private route     = inject(ActivatedRoute);
  private router    = inject(Router);

  loading = signal(true);
  venta   = signal<VentaShow | null>(null);
  banner  = signal<{ type: 'danger'; text: string } | null>(null);

  private printOnLoad = false;

  constructor() {
    const id    = Number(this.route.snapshot.paramMap.get('id'));
    const print = this.route.snapshot.queryParamMap.get('print');
    this.printOnLoad = print === '1';

    this.ventasSvc.get(id).subscribe({
      next: (v) => {
        this.venta.set(v);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.banner.set({ type: 'danger', text: 'No se pudo cargar la venta.' });
      },
    });

    
  }

  ngAfterViewInit() {
    if (this.printOnLoad) {
      // Esperar a que el DOM esté listo con los datos
      setTimeout(() => window.print(), 800);
    }
  }

  imprimir() {
    window.print();
  }

  volver() {
    this.router.navigate(['/operation/ventas']);
  }

  subtotalDetalle(cantidad: number, precio: number): number {
    return cantidad * precio;
  }
}
