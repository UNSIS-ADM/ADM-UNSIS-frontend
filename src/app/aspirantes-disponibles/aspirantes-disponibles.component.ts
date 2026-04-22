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
    { key: 'LICENCIATURA EN ENFERMERÍA',
      label: 'Licenciatura en Enfermería' },
    {
      key: 'LICENCIATURA EN INFORMÁTICA',
      label: 'Licenciatura en Informática',
    },
    {
      key: 'LICENCIATURA EN ODONTOLOGÍA',
      label: 'Licenciatura en Odontología',
    },
    { key: 'LICENCIATURA EN NUTRICIÓN',
      label: 'Licenciatura en Nutrición'
    },

    { key: 'LICENCIATURA EN MEDICINA',
      label: 'Licenciatura en Medicina'
    },

    { key: 'LICENCIATURA EN GOBIERNO Y DESARROLLO MUNICIPAL',
      label: 'Licenciatura en Gobierno y Desarrollo Municipal'
    },
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
    private alertService: AlertService,
  ) {
    const user = JSON.parse(localStorage.getItem('user_info') || '{}');
    this.roles = user.roles || [];
  }

  ngOnInit(): void {
    // Generar años automáticamente (años actuales y anteriores)
    const anioActual = new Date().getFullYear();
    this.anios = Array.from(
      { length: this.numAniosAtras + 1 },
      (_, i) => anioActual - i,
    );

    // Inicializa fichas y disponibles en 0
    this.carreras.forEach((c) => {
      this.fichas[c.key] = 0;
      this.disponibles[c.key] = 0;
      this.limitesActuales[c.key] = 0;
      this.inscritos[c.key] = 0;
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
    const carrerasValidas: any[] = [];
    const erroresValidacion: string[] = [];

    // 1. Separar lo que sirve de lo que tiene error
    this.carreras.forEach((carrera) => {
      const nuevoLimite = this.fichas[carrera.key] || 0;
      const limiteActual = this.limitesActuales[carrera.key] || 0;

      // Solo procesamos si el usuario escribió algo > 0
      if (nuevoLimite > 0) {
        if (nuevoLimite < limiteActual) {
          // ERROR: El usuario intentó bajar el límite
          erroresValidacion.push(
            `${carrera.label} Mínimo requerido: ${limiteActual}`,
          );
        } else {
          // VÁLIDO: Se agrega a la lista para enviar al servidor
          carrerasValidas.push({
            key: carrera.key,
            label: carrera.label,
            cantidad: nuevoLimite,
          });
        }
      }
    });

    // 2. Si hay errores, avisamos de inmediato pero NO detenemos el proceso de las demás
    if (erroresValidacion.length > 0) {
      this.alertService.showAlert(
        `No se actualizaron: ${erroresValidacion.join(', ')} por ser menores al límite actual.`,
        'danger',
      );
    }

    // 3. Si no hay ninguna carrera válida para mandar, terminamos aquí
    if (carrerasValidas.length === 0) {
      if (erroresValidacion.length === 0) {
        this.alertService.showAlert(
          'No hay fichas nuevas para registrar.',
          'warning',
        );
      }
      return;
    }

    // 4. Confirmación solo para las que SÍ son válidas
    const nombresValidos = carrerasValidas.map((c) => c.label).join(', ');
    this.abrirConfirmacion(
      `¿Confirmas el registro para: ${nombresValidos} en el año ${this.anioSeleccionado}?`,
      () => {
        this.showConfirmModal = false;
        this.cargando = true;

        const requests = carrerasValidas.map((c) => {
          return this.registroService
            .registrar(c.key, this.anioSeleccionado, c.cantidad)
            .pipe(
              map(() => ({
                label: c.label,
                cantidad: c.cantidad,
                success: true,
              })),
              catchError((err) => {
                console.error(`Error al registrar ${c.key}`, err);
                return of({
                  label: c.label,
                  cantidad: c.cantidad,
                  success: false,
                });
              }),
            );
        });

        forkJoin(requests).subscribe({
          next: (resultados) => {
            let delay = 0;
            resultados.forEach((res) => {
              setTimeout(() => {
                if (res.success) {
                  this.alertService.showAlert(
                    `${res.label}: ${res.cantidad} fichas registradas`,
                    'success',
                  );
                } else {
                  this.alertService.showAlert(
                    `${res.label}: Error en el servidor`,
                    'danger',
                  );
                }
              }, delay);
              delay += 1000;
            });

            // Limpiar solo lo que se envió con éxito y recargar
            setTimeout(() => {
              this.cargando = false;
              carrerasValidas.forEach((c) => (this.fichas[c.key] = 0));
              this.cargarVacantes(this.anioSeleccionado);
            }, delay);
          },
          error: () => {
            this.cargando = false;
            this.alertService.showAlert(
              'Error crítico al procesar la solicitud.',
              'danger',
            );
          },
        });
      },
    );
  }
  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }
}
