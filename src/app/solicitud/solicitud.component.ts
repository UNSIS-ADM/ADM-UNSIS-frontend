import { Component } from '@angular/core';
import { RespsolicitudService } from '../services/respsolicitud.service';
import { FooterComponent } from "../footer/footer.component";
import { NavComponent } from "../nav/nav.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-solicitud',
  imports: [FooterComponent, NavComponent, CommonModule],
  templateUrl: './solicitud.component.html',
  styleUrl: './solicitud.component.css'
})
export class SolicitudComponent {
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

  constructor(private respsolicitud: RespsolicitudService) {}

  ngOnInit(): void {
    this.respsolicitud.getRespSolicitud().subscribe({
      next: (data) => {
        // Tomar el primer elemento del arreglo
        this.alumno = (Array.isArray(data) && data.length > 0) ? data[0] : null;
        
        if (this.alumno) {
          this.actualizarFlags();
        } else {
          this.vacio = true;
        }

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
    const resultado = (this.alumno.result || '').toLowerCase().trim();

    this.esMedicina = carrera === 'licenciatura en medicina';
    this.esAceptado = resultado === 'aceptado';
    this.esReprobado = resultado === 'rechazado';
    this.esMedicinaReprobado = this.esMedicina && this.esReprobado;
    this.esOtraCarreraReprobado = !this.esMedicina && this.esReprobado;

    if (this.esMedicina) {
      this.resultado.promedio = this.alumno.score;
    }
  }
}
