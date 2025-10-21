import { Component, OnInit } from '@angular/core';
import { RegistroFichasService } from '../services/registro-fichas.service';
import { AlertService } from '../services/alert.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface Carrera {
  key: string;
  label: string;
}

@Component({
  selector: 'app-aspirantes-disponibles',
  templateUrl: './aspirantes-disponibles.component.html',
  styleUrls: ['./aspirantes-disponibles.component.css'],
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
})
export class AspirantesDisponiblesComponent implements OnInit {
  carreras: Carrera[] = [
    {
      key: 'LICENCIATURA EN ADMINISTRACIÓN PÚBLICA',
      label: 'Licenciatura en Administración Pública',
    },
    {
      key: 'LICENCIATURA EN CIENCIAS EMPRESARIALES',
      label: 'Licenciatura en Ciencias Empresariales',
    },
    {
      key: 'LICENCIATURA EN CIENCIAS BIOMÉDICAS',
      label: 'Licenciatura en Ciencias Biomédicas',
    },
    { key: 'LICENCIATURA EN ENFERMERÍA', label: 'Licenciatura en Enfermería' },
    {
      key: 'LICENCIATURA EN INFORMÁTICA',
      label: 'Licenciatura en Informática',
    },
    {
      key: 'LICENCIATURA EN ODONTOLOGÍA',
      label: 'Licenciatura en Odontología',
    },
    { key: 'LICENCIATURA EN NUTRICIÓN', label: 'Licenciatura en Nutrición' },
    { key: 'LICENCIATURA EN MEDICINA', label: 'Licenciatura en Medicina' },
  ];

  fichas: Record<string, number> = {}; // Editable
  disponibles: Record<string, number> = {}; // Solo lectura
  limitesActuales: Record<string, number> = {}; // Límite actual por carrera
  inscritos: Record<string, number> = {}; // nuevo campo
  cargando: boolean = false;
  roles: string[] = [];
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
  ) {
    const user = JSON.parse(localStorage.getItem('user_info') || '{}');
    this.roles = user.roles || [];
  }

  ngOnInit(): void {
    // Generar años automáticamente (años actuales y anteriores)
    const anioActual = new Date().getFullYear();
    this.anios = Array.from(
      { length: this.numAniosAtras + 1 },
      (_, i) => anioActual - i
    );

    // Inicializa fichas y disponibles en 0
    this.carreras.forEach((c) => {
      this.fichas[c.key] = 0;
      this.disponibles[c.key] = 0;
      this.limitesActuales[c.key] = 0;
      this.inscritos[c.key]= 0
    });

    // Carga vacantes del año seleccionado (actual por defecto)
    this.cargarVacantes(this.anioSeleccionado);
  }

  onAnioChange(): void {
    // Llama a cargarVacantes con el año que está seleccionado en el select
    this.cargarVacantes(this.anioSeleccionado);

    // Reinicia fichas al cambiar de año
    this.carreras.forEach((c) => (this.fichas[c.key] = 0));
  }

cargarVacantes(anio: number): void {
  this.registroService.obtenerVacantesPorAnio(anio).subscribe({
    next: (data) => {
      // Inicializa todo en 0
      this.carreras.forEach((c) => {
        this.disponibles[c.key] = 0;
        this.limitesActuales[c.key] = 0;
        this.inscritos[c.key] = 0;
      });

      // Cargar datos desde el endpoint
      data.forEach((item) => {
        const careerKey = item.career;
        if (this.disponibles.hasOwnProperty(careerKey)) {
          this.disponibles[careerKey] = item.availableSlots ?? 0;
          this.limitesActuales[careerKey] =
            item.cuposInserted ?? item.limitCount ?? 0;
          // 🔹 Aquí usamos directamente lo que trae el endpoint:
          this.inscritos[careerKey] = item.inscritosCount ?? 0;
        }
      });
    },
    error: (err) => {
      console.error('Error al obtener vacantes', err);
      this.alertService.showAlert('Error al obtener vacantes', 'danger');
    },
  });
}


  abrirConfirmacion(message: string, callback: () => void) {
    this.confirmMessage = message;
    this.confirmCallback = callback;
    this.showConfirmModal = true;
  }

  onInputChange(event: Event, key: string) {
    const input = event.target as HTMLInputElement;
    // Si el input queda vacío, asignamos 0
    this.fichas[key] = input.value ? Number(input.value) : 0;
  }

 registrarFichas(): void {
  const totalFichas = Object.values(this.fichas).reduce((a, b) => a + b, 0);

  // Si todas las fichas son 0, mostrar mensaje y salir
  if (totalFichas === 0) {
    this.alertService.showAlert('No hay fichas para registrar.', 'warning');
    return;
  }

  this.abrirConfirmacion(
    `¿Estás seguro de registrar estas fichas para el año ${this.anioSeleccionado}?`,
    () => {
      this.showConfirmModal = false;
      this.cargando = true;

      // 🔹 Filtramos solo las carreras con fichas > 0
      const carrerasConFichas = this.carreras.filter(
        (c) => (this.fichas[c.key] ?? 0) > 0
      );

      // 🔹 Crear array de observables solo con las que tienen fichas > 0
      const requests = carrerasConFichas.map((carrera) => {
        const cantidad = this.fichas[carrera.key];
        return this.registroService
          .registrar(carrera.key, this.anioSeleccionado, cantidad)
          .pipe(
            map(() => ({ label: carrera.label, cantidad, success: true })),
            catchError((err) => {
              console.error(`Error al registrar ${carrera.key}`, err);
              return of({ label: carrera.label, cantidad, success: false });
            })
          );
      });

      // 🔹 Si no hay solicitudes válidas, salir
      if (requests.length === 0) {
        this.alertService.showAlert('No hay fichas válidas para registrar.', 'warning');
        this.cargando = false;
        return;
      }

      // 🔹 Ejecutar todos en paralelo
      forkJoin(requests).subscribe({
        next: (resultados) => {
          let delay = 0;
          resultados.forEach((res) => {
            setTimeout(() => {
              if (res.success) {
                this.alertService.showAlert(
                  `${res.label}: ${res.cantidad} fichas registradas`,
                  'success'
                );
              } else {
                this.alertService.showAlert(
                  `${res.label}: error al registrar las fichas`,
                  'danger'
                );
              }
            }, delay);
            delay += 1000;
          });

          // 🔹 Limpiar inputs y recargar vacantes
          setTimeout(() => {
            this.cargando = false;
            this.carreras.forEach((c) => (this.fichas[c.key] = 0));
            this.cargarVacantes(this.anioSeleccionado);
          }, delay);
        },
        error: (err) => {
          console.error('Error general al registrar fichas', err);
          this.alertService.showAlert('No se pudieron registrar las fichas', 'danger');
          this.cargando = false;
        },
      });
    }
  );
}

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }
}
