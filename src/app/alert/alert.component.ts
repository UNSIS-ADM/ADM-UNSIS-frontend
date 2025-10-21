import { Component, OnInit } from '@angular/core';
import { AlertService, Alert } from '../services/alert.service';
import { CommonModule } from '@angular/common';

/**
 * Componente para mostrar alertas en la aplicación
 * Se suscribe al servicio de alertas para mostrar mensajes al usuario
 * 
 * @example
 * <app-alert></app-alert>
 */
@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  imports: [CommonModule],
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {
  /** Array que almacena las alertas activas */
  alerts: Alert[] = [];

  /**
   * Constructor del componente
   * @param alertService Servicio que gestiona las alertas del sistema
   */
  constructor(private alertService: AlertService) {}

  /**
   * Inicializa el componente
   * Se suscribe al observable de alertas para mantener actualizada la lista
   */
  ngOnInit() {
    this.alertService.alerts$.subscribe(alerts => {
      this.alerts = alerts;
    });
  }
}
