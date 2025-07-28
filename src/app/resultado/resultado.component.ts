import { Component, OnInit } from '@angular/core';
import { NavComponent } from "../nav/nav.component";
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-resultado',
  standalone: true,
  imports: [NavComponent, MatCardModule, CommonModule, FooterComponent],
  templateUrl: './resultado.component.html',
  styleUrls: ['./resultado.component.css']
})
export class ResultadoComponent implements OnInit {
  emailContacto = 'admision.unsis@gmail.com';
  
  // Datos del alumno
  alumno = {
    nombre: 'Juan Pérez',
    matricula: '20231234',
    carrera: 'informatica', // Cambiar entre 'medicina' y otras carreras para probar
    aprobado: 'Aprobado', // Cambiar entre 'Aprobado' y 'Reprobado'
    promedio: 75 // Solo para medicina
  };

  // Resultado específico para medicina
  resultado = {
    promedio: this.alumno.promedio
  };

  // Flags para controlar la vista
  vacio = false;
  esMedicina = this.alumno.carrera.toLowerCase() === 'medicina';
  esAceptado = this.alumno.aprobado === 'Aprobado';
  esReprobado = this.alumno.aprobado === 'Reprobado';
  esMedicinaReprobado = this.esMedicina && this.esReprobado;
  esOtraCarreraReprobado = !this.esMedicina && this.esReprobado;

  constructor() { }

  ngOnInit(): void {
    this.actualizarFlags();
  }

  // Método para actualizar las banderas cuando cambian los datos
  actualizarFlags() {
    this.esMedicina = this.alumno.carrera.toLowerCase() === 'medicina';
    this.esAceptado = this.alumno.aprobado === 'Aprobado';
    this.esReprobado = this.alumno.aprobado === 'Reprobado';
    this.esMedicinaReprobado = this.esMedicina && this.esReprobado;
    this.esOtraCarreraReprobado = !this.esMedicina && this.esReprobado;

    // Actualizar resultado para medicina si es necesario
    if (this.esMedicina) {
      this.resultado.promedio = this.alumno.promedio;
    }
  }

  // Método de ejemplo para cargar datos desde un servicio
  /*
  cargarDatosAlumno() {
    const matricula = // obtener matrícula de la URL o localStorage
    this.alumnoService.getResultado(matricula).subscribe({
      next: (data) => {
        this.alumno = data;
        this.actualizarFlags();
      },
      error: (err) => {
        console.error('Error al cargar resultados:', err);
        this.vacio = true;
      }
    });
  }
  */
}