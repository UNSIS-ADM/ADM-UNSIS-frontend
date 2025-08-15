import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { NavComponent } from "../nav/nav.component";
import { FooterComponent } from "../footer/footer.component";
import { ApplicantService } from '../services/applicant.service';
import { AlertService } from '../services/alert.service';


@Component({
  selector: 'app-nueva-carrera-applicant',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    NavComponent,
    FooterComponent,
  ],
  templateUrl: './nueva-carrera-applicant.component.html',
  styleUrls: ['./nueva-carrera-applicant.component.css'],
})
export class NuevaCarreraApplicantComponent implements OnInit {
  carrerasDisponibles: { nombre: string }[] = [];

  formData = {
    carrera: '',
    comentario: '',
  };

  constructor(
    private http: HttpClient,
    private applicantService: ApplicantService
    , private alertService: AlertService
  ) {
    this.carrerasDisponibles.push(
      { nombre: 'LICENCIATURA EN INFORMATICA' },
      { nombre: 'LICENCIATURA EN ENFERMERÍA' },
      { nombre: 'LICENCIATURA EN ODONTOLOGIA' },
      { nombre: 'LICENCIATURA EN NUTRICION' },
      { nombre: 'LICENCIATURA EN CIENCIAS BIOMÉDICAS' },
      { nombre: 'LICENCIATURA EN CIENCIAS EMPRESARIALES' },
      { nombre: 'LICENCIATURA EN ADMINISTRACION PÚBLICA' }
    );
  }

  /**
   *
      { nombre: 'Liecenciatura en Informática' },
      { nombre: 'Liecenciatura en Enfermería' },
      { nombre: 'Liecenciatura en Odontología' },
      { nombre: 'Liecenciatura en Nutrición' },
      { nombre: 'Liecenciatura en Ciencias Biomédicas' },
      { nombre: 'Liecenciatura en Ciencias Empresariales' },
      { nombre: 'Liecenciatura en Administración Pública' }
   */
  ngOnInit(): void {}

  submitForm(): void {
    if (!this.formData.carrera || !this.formData.comentario) {
      this.alertService.showAlert('Por favor completa todos los campos', 'warning');
      return;
    }

    this.applicantService
      .changeCareer(this.formData.carrera, this.formData.comentario)
      .subscribe({
        next: () => {
          this.alertService.showAlert('Solicitud enviada exitosamente', 'success');
          this.formData = { carrera: '', comentario: '' };
        },
        error: (err) => {
          console.error('Error al enviar la solicitud:', err);
         this.alertService.showAlert('Ya tienes una solicitud en el sistema', 'danger');
        },
      });
  }
}
