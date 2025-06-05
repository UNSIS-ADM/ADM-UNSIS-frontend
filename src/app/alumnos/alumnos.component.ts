import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../nav/nav.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-alumnos',
  standalone: true,
  imports: [CommonModule, NavComponent, FooterComponent],
  templateUrl: './alumnos.component.html',
  styleUrls: ['./alumnos.component.css']
})
export class AlumnosComponent {
  alumnos = [
    { id: 1, nombre: 'Juan Pérez', matricula: '20241001', carrera: 'Informática', promedio: 8.5, estado: 'Reprobado' },
    { id: 2, nombre: 'María García', matricula: '20241002', carrera: 'Sistemas', promedio: 9.0, estado: 'Aprobado' },
    { id: 3, nombre: 'Carlos López', matricula: '20241003', carrera: 'Informática', promedio: 8.7, estado: 'Reprobado' },
    { id: 4, nombre: 'Jose perez', matricula: '20241004', carrera: 'Informática', promedio: 8.7, estado: 'Aprobado' },
  ];
}
