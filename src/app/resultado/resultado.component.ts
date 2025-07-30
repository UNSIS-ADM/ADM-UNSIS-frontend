import { Component, OnInit } from '@angular/core';
import { NavComponent } from "../nav/nav.component";
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';
import { ResultadosMostrarService } from '../services/resultados-mostrar.service'; // Cambia la importación

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
  alumno: any = null;

  // Resultado específico para medicina
  resultado = {
    promedio: null
  };

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
    // Normaliza los valores para evitar problemas de mayúsculas/minúsculas
    const carrera = (this.alumno.career || '').toLowerCase().trim();
    const resultado = (this.alumno.result || '').toLowerCase().trim();

    this.esMedicina = carrera === 'licenciatura en medicina';
    this.esAceptado = resultado === 'aceptado';
    this.esReprobado = resultado === 'rechazado';
    this.esMedicinaReprobado = this.esMedicina && this.esReprobado;
    this.esOtraCarreraReprobado = !this.esMedicina && this.esReprobado;

    // Actualizar resultado para medicina si es necesario
    if (this.esMedicina) {
      this.resultado.promedio = this.alumno.score;
    }
  }
}