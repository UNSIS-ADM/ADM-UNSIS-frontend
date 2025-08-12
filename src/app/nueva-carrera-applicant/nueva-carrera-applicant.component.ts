import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { NavComponent } from "../nav/nav.component";
import { FooterComponent } from "../footer/footer.component";
import { ApplicantService } from '../services/applicant.service';

@Component({
  selector: 'app-nueva-carrera-applicant',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NavComponent, FooterComponent],
  templateUrl: './nueva-carrera-applicant.component.html',
  styleUrls: ['./nueva-carrera-applicant.component.css']
})
export class NuevaCarreraApplicantComponent implements OnInit {

  carrerasDisponibles: { nombre: string}[] = [];

  formData = {
    carrera: '',
    comentario: ''
  };

  constructor(private http: HttpClient, private applicantService: ApplicantService) {
    this.carrerasDisponibles.push(
      { nombre: 'LICENCIATURA EN INFORMATICA' },
      { nombre: 'LICENCIATURA EN ENFERMERÍA' },
      { nombre: 'LICENCIATURA EN ODONTOLOGIA' },
      { nombre: 'LICENCIATURA EN NUTRICION'},
      { nombre: 'LICENCIATURA EN ADMINISTRACION PÚBLICA' },
      { nombre: 'LICENCIATURA EN CIENCIAS BIOMÉDICAS' },
    );
  }

  ngOnInit(): void {
  
  }



  submitForm(): void {
    if (!this.formData.carrera || !this.formData.comentario) {
      alert('Por favor completa todos los campos');
      return;
    }

    this.applicantService.changeCareer(this.formData.carrera, this.formData.comentario)
      .subscribe({
        next: () => {
          alert('Solicitud enviada correctamente');
          this.formData = { carrera: '', comentario: '' };
         
        },
        error: (err) => {
          console.error('Error al enviar la solicitud:', err);
          alert('Hubo un problema al enviar la solicitud');
        }
      });
  }
}
