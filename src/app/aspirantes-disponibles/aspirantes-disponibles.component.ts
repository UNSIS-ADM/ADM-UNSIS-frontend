import { Component, OnInit } from '@angular/core';
import { RegistroFichasService } from '../services/registro-fichas.service';
import { AlertService } from '../services/alert.service';
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

  fichas: Record<string, number> = {};      // Editable
  disponibles: Record<string, number> = {}; // Solo lectura
  cargando: boolean = false;

  constructor(
    private registroService: RegistroFichasService,
    private alertService: AlertService
  ) {}

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
        data.forEach(item => {
          if (this.disponibles.hasOwnProperty(item.career)) {
            this.disponibles[item.career] = item.availableSlots;
          }
        });
      },
      error: (err) => {
        console.error('Error al obtener vacantes', err);
        this.alertService.showAlert('Error al obtener vacantes', 'danger');
      }
    });
  }

  registrarFichas(): void {
  this.cargando = true;
  const year = new Date().getFullYear();

  const peticiones = this.carreras.map(carrera => {
    const cantidad = this.fichas[carrera.key];
    return this.registroService.registrar(carrera.key, year, cantidad)
      .toPromise()
      .then(() => ({ label: carrera.label, cantidad, success: true }))
      .catch(() => ({ label: carrera.label, cantidad, success: false }));
  });

  Promise.all(peticiones).then(resultados => {
    let delay = 0; // tiempo inicial en ms

    resultados.forEach(res => {
      setTimeout(() => {
        if (res.success) {
          this.alertService.showAlert(`${res.label}: ${res.cantidad} fichas registradas`, 'success');
        } else {
          this.alertService.showAlert(`${res.label}: error al registrar las fichas`, 'danger');
        }
      }, delay);

      delay += 1000; // incrementa 1 segundo para la siguiente alerta
    });

    // Después de mostrar todas las alertas, desactiva cargando
    setTimeout(() => {
      this.cargando = false;
    }, delay);
  }).catch(err => {
    console.error('Error general al registrar fichas', err);
    this.alertService.showAlert('No se pudieron registrar las fichas', 'danger');
    this.cargando = false;
  });
}

}
