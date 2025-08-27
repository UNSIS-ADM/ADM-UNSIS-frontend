import { Component, OnInit } from '@angular/core';
import { RegistroFichasService } from '../services/registro-fichas.service';
import { AlertService } from '../services/alert.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";

interface Carrera {
  key: string;
  label: string;
}

@Component({
  selector: 'app-aspirantes-disponibles',
  templateUrl: './aspirantes-disponibles.component.html',
  styleUrls: ['./aspirantes-disponibles.component.css'],
  imports: [CommonModule, FormsModule, ConfirmDialogComponent]
})
export class AspirantesDisponiblesComponent implements OnInit {
  carreras: Carrera[] = [
    { key: 'LICENCIATURA EN ADMINISTRACION PÚBLICA', label: 'Licenciatura en Administración Pública' },
    { key: 'LICENCIATURA EN CIENCIAS EMPRESARIALES', label: 'Licenciatura en Ciencias Empresariales' },
    { key: 'LICENCIATURA EN CIENCIAS BIOMÉDICAS', label: 'Licenciatura en Ciencias Biomédicas' },
    { key: 'LICENCIATURA EN ENFERMERÍA', label: 'Licenciatura en Enfermería' },
    { key: 'LICENCIATURA EN INFORMATICA', label: 'Licenciatura en Informática' },
    { key: 'LICENCIATURA EN ODONTOLOGÍA', label: 'Licenciatura en Odontología' },
    { key: 'LICENCIATURA EN NUTRICION', label: 'Licenciatura en Nutrición' }
  ];

  fichas: Record<string, number> = {};           // Editable
  disponibles: Record<string, number> = {};      // Solo lectura
  limitesActuales: Record<string, number> = {};  // Límite actual por carrera
  cargando: boolean = false;

  // Modal
  showConfirmModal = false;
  confirmMessage = '';
  confirmCallback: (() => void) | null = null;

  // Años
  anios: number[] = [];
  anioSeleccionado: number = new Date().getFullYear();
  numAniosAtras: number = 5; // Cantidad de años anteriores a mostrar

  constructor(
    private registroService: RegistroFichasService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    // Generar años automáticamente (años actuales y anteriores)
    const anioActual = new Date().getFullYear();
    this.anios = Array.from({ length: this.numAniosAtras + 1 }, (_, i) => anioActual - i);

    // Inicializa fichas y disponibles en 0
    this.carreras.forEach(c => {
      this.fichas[c.key] = 0;
      this.disponibles[c.key] = 0;
      this.limitesActuales[c.key] = 0;
    });

    // Carga vacantes del año seleccionado (actual por defecto)
    this.cargarVacantes(this.anioSeleccionado);
  }

 onAnioChange(): void {
  // Llama a cargarVacantes con el año que está seleccionado en el select
  this.cargarVacantes(this.anioSeleccionado);

  // Reinicia fichas al cambiar de año
  this.carreras.forEach(c => this.fichas[c.key] = 0);
}


  cargarVacantes(anio: number): void {
    this.registroService.obtenerVacantesPorAnio(anio).subscribe({
      next: (data) => {
        // Reinicia disponibles y límites
        this.carreras.forEach(c => {
          this.disponibles[c.key] = 0;
          this.limitesActuales[c.key] = 0;
        });

        data.forEach(item => {
          if (this.disponibles.hasOwnProperty(item.career)) {
            this.disponibles[item.career] = item.availableSlots;
            this.limitesActuales[item.career] = item.limitCount || 0;
          }
        });
      },
      error: (err) => {
        console.error('Error al obtener vacantes', err);
        this.alertService.showAlert('Error al obtener vacantes', 'danger');
      }
    });
  }

  abrirConfirmacion(message: string, callback: () => void) {
    this.confirmMessage = message;
    this.confirmCallback = callback;
    this.showConfirmModal = true;
  }

  registrarFichas(): void {
    const totalFichas = Object.values(this.fichas).reduce((a, b) => a + b, 0);

    this.abrirConfirmacion(
      `¿Estás seguro de registrar estas fichas para el año ${this.anioSeleccionado}?`,
      () => {
        this.showConfirmModal = false;
        this.cargando = true;

        const peticiones = this.carreras.map(carrera => {
          const cantidad = this.fichas[carrera.key];
          return this.registroService.registrar(carrera.key, this.anioSeleccionado, cantidad)
            .toPromise()
            .then(() => ({ label: carrera.label, cantidad, success: true }))
            .catch(() => ({ label: carrera.label, cantidad, success: false }));
        });

        Promise.all(peticiones).then(resultados => {
          let delay = 0;
          resultados.forEach(res => {
            setTimeout(() => {
              if (res.success) {
                this.alertService.showAlert(`${res.label}: ${res.cantidad} fichas registradas`, 'success');
              } else {
                this.alertService.showAlert(`${res.label}: error al registrar las fichas`, 'danger');
              }
            }, delay);
            delay += 1000;
          });

          // Recarga la página después de mostrar todas las alertas
          setTimeout(() => {
            this.cargando = false;
            window.location.reload();
          }, delay);
        }).catch(err => {
          console.error('Error general al registrar fichas', err);
          this.alertService.showAlert('No se pudieron registrar las fichas', 'danger');
          this.cargando = false;
        });
      }
    );
  }
  

}
