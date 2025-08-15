// alert.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type AlertType = 'success' | 'danger' | 'info' | 'warning';

export interface Alert {
  message: string;
  type: AlertType;
  id: number;
  show: boolean;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  private alertsSubject = new Subject<Alert[]>();
  alerts$ = this.alertsSubject.asObservable();

  private alerts: Alert[] = [];
  private idCounter = 0;

  showAlert(message: string, type: AlertType) {
    const alert: Alert = {
      message,
      type,
      id: this.idCounter++,
      show: false
    };
    this.alerts.unshift(alert);
    this.alertsSubject.next(this.alerts);

    // Activar animación de entrada
    setTimeout(() => {
      alert.show = true;
      this.alertsSubject.next(this.alerts);
    }, 10);

    // Después de mostrar 4 segundos, iniciar desvanecimiento
    setTimeout(() => this.fadeOutAlert(alert.id), 4000);
  }

  fadeOutAlert(id: number) {
    const alert = this.alerts.find(a => a.id === id);
    if (!alert) return;
    alert.show = false;
    this.alertsSubject.next(this.alerts);

    // Después de animación, eliminar
    setTimeout(() => this.removeAlert(id), 500);
  }

  removeAlert(id: number) {
    this.alerts = this.alerts.filter(a => a.id !== id);
    this.alertsSubject.next(this.alerts);
  }
}
