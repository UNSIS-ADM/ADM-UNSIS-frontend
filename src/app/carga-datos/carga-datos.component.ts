import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../nav/nav.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-carga-datos',
  standalone: true,
  imports: [CommonModule, NavComponent, FooterComponent],
  templateUrl: './carga-datos.component.html',
  styleUrls: ['./carga-datos.component.css']
})
export class CargaDatosComponent {
  datos = [
    { id: 1, nombre: 'Juan Pérez', matricula: '2024001', carrera: 'Informática', fecha: '2024-06-04', estado: 'Cargado' },
    { id: 2, nombre: 'María López', matricula: '2024002', carrera: 'Sistemas', fecha: '2024-06-04', estado: 'Pendiente' },
    { id: 3, nombre: 'Carlos García', matricula: '2024003', carrera: 'Informática', fecha: '2024-06-04', estado: 'Cargado' },
  ];
}
