import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import {
  CardComponent,
  CardBodyComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
  TextColorDirective,
  ProgressBarDirective,
  ProgressBarComponent,
  ProgressComponent,
  ButtonDirective,
  SpinnerComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { DashboardService } from './data/dashboard.service';
import { DashboardData } from './data/dashboard.models';

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DecimalPipe,
    TextColorDirective,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    RowComponent,
    ColComponent,
    IconDirective,
    ProgressBarDirective,
    ProgressBarComponent,
    ProgressComponent,
    ButtonDirective,
    SpinnerComponent
  ]
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  dashboardData: DashboardData | null = null;
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = null;

    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        // Convertir strings a números
        this.dashboardData = {
          ventas_hoy: Number(data.ventas_hoy) || 0,
          ventas_mes: Number(data.ventas_mes) || 0,
          compras_mes: Number(data.compras_mes) || 0,
          tickets_hoy: Number(data.tickets_hoy) || 0,
          cxc_pendiente: Number(data.cxc_pendiente) || 0,
          cxc_vencida: Number(data.cxc_vencida) || 0,
          cxp_pendiente: Number(data.cxp_pendiente) || 0,
          cxp_vencida: Number(data.cxp_vencida) || 0,
          saldo_caja: Number(data.saldo_caja) || 0,
          saldo_caja_hoy: Number(data.saldo_caja_hoy) || 0,
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard:', err);
        this.error = 'Error al cargar los datos del dashboard';
        this.loading = false;
      }
    });
  }

  get cxcTotal(): number {
    if (!this.dashboardData) return 0;
    return this.dashboardData.cxc_pendiente + this.dashboardData.cxc_vencida;
  }

  get cxpTotal(): number {
    if (!this.dashboardData) return 0;
    return this.dashboardData.cxp_pendiente + this.dashboardData.cxp_vencida;
  }

  get cxcVencidaPct(): number {
    const total = this.cxcTotal;
    if (total === 0) return 0;
    return (this.dashboardData!.cxc_vencida / total) * 100;
  }

  get cxpVencidaPct(): number {
    const total = this.cxpTotal;
    if (total === 0) return 0;
    return (this.dashboardData!.cxp_vencida / total) * 100;
  }
}

