import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { ApplicantService } from '../services/applicant.service';
import { AlertService } from '../services/alert.service';
import { ResultadosMostrarService } from '../services/resultados-mostrar.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nueva-carrera-applicant',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './nueva-carrera-applicant.component.html',
  styleUrls: ['./nueva-carrera-applicant.component.css'],
})
export class NuevaCarreraApplicantComponent implements OnInit {
  carrerasDisponibles: { nombre: string }[] = [];

  formData = {
    carrera: '',
    comentario: '',
  };

  carreraActual: string = '';

  constructor(
    private applicantService: ApplicantService,
    private alertService: AlertService,
    private resultadosService: ResultadosMostrarService,
    private router: Router
  ) {
    this.carrerasDisponibles.push(
      { nombre: 'LICENCIATURA EN INFORMÁTICA' },
      { nombre: 'LICENCIATURA EN ENFERMERÍA' },
      { nombre: 'LICENCIATURA EN ODONTOLOGÍA' },
      { nombre: 'LICENCIATURA EN NUTRICIÓN' },
      { nombre: 'LICENCIATURA EN CIENCIAS BIOMÉDICAS' },
      { nombre: 'LICENCIATURA EN CIENCIAS EMPRESARIALES' },
      { nombre: 'LICENCIATURA EN ADMINISTRACIÓN PÚBLICA' }
    );
  }

  ngOnInit(): void {
    this.resultadosService.getResultadosUsuario().subscribe({
      next: (data) => {
        this.carreraActual = (data.career || '').trim().toUpperCase();
        console.log('Carrera actual:', this.carreraActual);

        this.carrerasDisponibles = this.carrerasDisponibles.filter(
          (c) => c.nombre.toUpperCase() !== this.carreraActual
        );
      },
      error: (err) => {
        console.error('Error al obtener carrera del alumno:', err);
        this.alertService.showAlert('No se pudo cargar tu carrera actual', 'danger');
      },
    });
  }

  submitForm(): void {
    if (!this.formData.carrera || !this.formData.comentario) {
      this.alertService.showAlert('Por favor completa todos los campos', 'warning');
      return;
    }

    if (this.formData.carrera.toUpperCase() === this.carreraActual) {
      this.alertService.showAlert('No puedes seleccionar tu misma carrera', 'danger');
      return;
    }

    // 🟡 NUEVO: Validar fichas disponibles antes de enviar solicitud
    this.applicantService.getVacantesDisponibles().subscribe({
      next: (vacantes: any[]) => {
        const carreraSeleccionada = vacantes.find(
          (v) => v.career === this.formData.carrera
        );

        if (!carreraSeleccionada) {
          this.alertService.showAlert('Carrera no encontrada en el sistema', 'danger');
          return;
        }

        if (carreraSeleccionada.availableSlots === 0) {
          this.alertService.showAlert(
            'No hay fichas disponibles en esta carrera',
            'danger'
          );
          return;
        }

        // ✅ Si hay fichas disponibles, enviar la solicitud
        this.applicantService
          .changeCareer(this.formData.carrera, this.formData.comentario)
          .subscribe({
            next: () => {
              this.alertService.showAlert('Solicitud enviada exitosamente', 'success');
              this.formData = { carrera: '', comentario: '' };
              this.router.navigate(['/respsolicitud']);
            },
            error: (err) => {
              console.error('❌ Error devuelto por el backend:', err);
              this.alertService.showAlert(
                'Ya tienes una solicitud en el sistema',
                'danger'
              );
              this.router.navigate(['/respsolicitud']);
            },
          });
      },
      error: (err) => {
        console.error('Error al obtener vacantes disponibles:', err);
        this.alertService.showAlert('Error al verificar las vacantes', 'danger');
      },
    });
  }
}
