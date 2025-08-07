import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavComponent } from "../nav/nav.component";
import { FooterComponent } from "../footer/footer.component";
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-nueva-carrera-applicant',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NavComponent, FooterComponent],
  templateUrl: './nueva-carrera-applicant.component.html',
  styleUrls: ['./nueva-carrera-applicant.component.css']
})
export class NuevaCarreraApplicantComponent implements OnInit {

  carrerasDisponibles: { nombre: string, cupo: number }[] = [];

  formData = {
    carrera: '',
    comentario: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.obtenerCarreras();
  }

  obtenerCarreras(): void {
    this.http.get<{ nombre: string, cupo: number }[]>('/api/carreras-con-cupo')
      .subscribe({
        next: (data) => {
          this.carrerasDisponibles = data.filter(c => c.cupo > 0);
        },
        error: (err) => {
          console.error('Error al obtener carreras:', err);
        }
      });
  }

  submitForm(): void {
    if (!this.formData.carrera || !this.formData.comentario) {
      alert('Por favor completa todos los campos');
      return;
    }

    this.http.post('/api/solicitud-cambio', this.formData).subscribe({
      next: () => {
        alert('Solicitud enviada correctamente');
        this.formData = { carrera: '', comentario: '' };
        this.obtenerCarreras(); // Refresca cupo
      },
      error: (err) => {
        console.error('Error al enviar la solicitud:', err);
        alert('Hubo un problema al enviar la solicitud');
      }
    });
  }
}
