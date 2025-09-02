import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { ResultadosMostrarService } from '../services/resultados-mostrar.service'; // Cambia la importación
import { AlertService } from '../services/alert.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-resultado',
  standalone: true,
  imports: [MatCardModule, CommonModule,RouterLink],
  templateUrl: './resultado.component.html',
  styleUrls: ['./resultado.component.css']
})
export class ResultadoComponent implements OnInit {
  emailContacto = 'admision.unsis@gmail.com';

  // Datos del alumno
  alumno: any = null;

  // Resultado específico para medicina
  resultado = {
    promedio: null
  };
// resultado.component.ts
todasCarreras: string[] = [
  'Licenciatura en Administración Municipal',
  'Licenciatura en Ciencias Empresariales',
  'Licenciatura en Administración Pública',
  'Licenciatura en Informática',
  'Licenciatura en Enfermería',
  'Licenciatura en Odontología',
  'Licenciatura en Nutrición',
  'Licenciatura en Ciencias Biomédicas (En proceso de registro)'
];

carrerasDisponibles: string[] = [];

  // Flags para controlar la vista
  vacio = false;
  esMedicina = false;
  esAceptado = false;
  esReprobado = false;
  esMedicinaReprobado = false;
  esOtraCarreraReprobado = false;

  constructor(private resultadosService: ResultadosMostrarService) { } // Cambia el tipo de servicio

  ngOnInit(): void {
    this.resultadosService.getResultadosUsuario().subscribe({
      next: (data) => {
        this.alumno = data;
        this.actualizarFlags();
        console.log('Datos del alumno:', this.alumno);
      },
      error: (err) => {
        console.error('Error al cargar resultados:', err);
        this.vacio = true;
      }
    });
  }

  // Método para actualizar las banderas cuando cambian los datos
actualizarFlags() {
  if (!this.alumno) return;

  const carrera = (this.alumno.career || '').toLowerCase().trim();
  const resultado = (this.alumno.status || '').toLowerCase().trim();

  this.esMedicina = carrera === 'licenciatura en medicina';
  this.esAceptado = resultado === 'aceptado';
  this.esReprobado = resultado === 'rechazado';
  this.esMedicinaReprobado = this.esMedicina && this.esReprobado;
  this.esOtraCarreraReprobado = !this.esMedicina && this.esReprobado;

  if (this.esMedicina) {
    this.resultado.promedio = this.alumno.score;
  }

  // 🔥 Filtrar las carreras disponibles quitando la del alumno
  this.carrerasDisponibles = this.todasCarreras.filter(
    c => c.toLowerCase().trim() !== carrera
  );
}

}