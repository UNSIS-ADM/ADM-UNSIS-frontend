import { Component, OnInit } from '@angular/core';
import { RegistroFichasService } from '../services/registro-fichas.service';
import { FooterComponent } from "../footer/footer.component";
import { NavComponent } from "../nav/nav.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Carrera {
  key: string;
  label: string;
}

@Component({
  selector: 'app-aspirantes-disponibles',
  templateUrl: './aspirantes-disponibles.component.html',
  styleUrls: ['./aspirantes-disponibles.component.css'],
  imports: [FooterComponent, NavComponent, CommonModule, FormsModule]
})
export class AspirantesDisponiblesComponent implements OnInit {
  carreras: Carrera[] = [
    { key: 'LICENCIATURA EN ADMINISTRACION PÚBLICA', label: 'Licenciatura en Administración pública' },
    { key: 'LICENCIATURA EN CIENCIAS EMPRESARIALES', label: 'Licenciatura en ciencias empresariales' },
    { key: 'LICENCIATURA EN CIENCIAS BIOMÉDICAS', label: 'Licenciatura en ciencias biomédicas' },
    { key: 'LICENCIATURA EN ENFERMERÍA', label: 'Licenciatura en enfermería' },
    { key: 'LICENCIATURA EN INFORMATICA', label: 'Licenciatura en informática' },
    { key: 'LICENCIATURA EN ODONTOLOGÍA', label: 'Licenciatura en odontología' },
    { key: 'LICENCIATURA EN NUTRICION', label: 'Licenciatura en nutrición' }
  ];

  fichas: Record<string, number> = {};       // Editable
  disponibles: Record<string, number> = {};  // Solo lectura
  mensaje: string = '';
  cargando: boolean = false;

  constructor(private registroService: RegistroFichasService) {}

  ngOnInit(): void {
    const year = new Date().getFullYear();

    // Inicializa en 0
    this.carreras.forEach(c => {
      this.fichas[c.key] = 0;
      this.disponibles[c.key] = 0;
    });

    // Consulta los disponibles del año
    this.registroService.obtenerVacantesPorAnio(year).subscribe({
      next: (data) => {
        /**
         * Se espera un arreglo tipo:
         * [{ career: 'LICENCIATURA EN INFORMATICA', availableSlots: 15 }, ...]
         */
        data.forEach(item => {
          if (this.disponibles.hasOwnProperty(item.career)) {
            this.disponibles[item.career] = item.availableSlots;
          }
        });
      },
      error: (err) => console.error('Error al obtener vacantes', err)
    });
  }

  registrarFichas(): void {
    this.cargando = true;
    const year = new Date().getFullYear();

    const peticiones = this.carreras.map(carrera => {
      const cantidad = this.fichas[carrera.key];
      return this.registroService
        .registrar(carrera.key, year, cantidad)
        .toPromise()
        .then(() => `${carrera.label}: ${cantidad} fichas`)
        .catch(() => `${carrera.label}: error`);
    });

    Promise.all(peticiones).then(resultados => {
      this.mensaje = resultados.join(', ');
      this.cargando = false;
    });
  }
}
