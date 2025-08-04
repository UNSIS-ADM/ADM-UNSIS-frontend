import { Component, OnInit } from '@angular/core';
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
  imports: [FooterComponent, NavComponent,CommonModule,FormsModule]
})
export class AspirantesDisponiblesComponent implements OnInit {
  carreras: Carrera[] = [
    { key: 'Administración pública', label: 'Licenciatura en Administración pública' },
    { key: 'ciencias empresariales', label: 'Licenciatura en ciencias empresariales' },
    { key: 'ciencias biomedicas', label: 'Licenciatura en ciencias biomédicas' },
    { key: 'enfermeria', label: 'Licenciatura en enfermería' },
    { key: 'informatica', label: 'Licenciatura en informática' },
    { key: 'odontologia', label: 'Licenciatura en odontología' },
    { key: 'nutricion', label: 'Licenciatura en nutrición' }
  ];

  fichas: Record<string, number> = {};
  mensaje: string = '';

  ngOnInit(): void {
    this.carreras.forEach(c => {
      this.fichas[c.key] = 0;
    });
  }

  registrarFichas(): void {
    // Aquí eventualmente conectarás con un endpoint real
    this.mensaje = this.generarMensajeConfirmacion();
    console.log('Fichas registradas:', this.fichas);
  }

  private generarMensajeConfirmacion(): string {
    return this.carreras
      .map(c => `${c.label}: ${this.fichas[c.key]} fichas`)
      .join(', ');
  }
}
