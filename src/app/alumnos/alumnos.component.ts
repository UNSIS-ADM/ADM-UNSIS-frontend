import { Component } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
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
    { id: 1, nombre: 'Juan Pérez', matricula: '20241001', career: 'Informática', curp: 'SSAD090804SJNCJJSKAKS', location:'Miahuatlan',exam_room:'Sala 3',exam_date:'Viernes 9 de julio', phone:9511030404,status: 'Reprobado' },
    { id: 2, nombre: 'María García', matricula: '20241002', career: 'Sistemas', curp:'SSAD090804SJNCJJSKAKS', location: 'Miahuatlan',exam_room:'Sala 3',exam_date:'viernes 9 de julio',phone:9511030404, status: 'Aprobado' },
    { id: 3, nombre: 'Carlos López', matricula: '20241003', career: 'Informática', curp:'SSAD090804SJNCJJSKAKS', location: 'Miahuatlan',exam_room:'Sala 4',exam_date:'Viernes 9 de julio',phone:9511030404, status: 'Reprobado' },
    { id: 4, nombre: 'Jose perez', matricula: '20241004', career: 'Informática', curp: 'SSAD090804SJNCJJSKAKS', location: 'Miahuatlan', exam_room:'Sala 5',exam_date:'Viernes 9 de julio',phone:9511030404,status: 'Aprobado' },
  ];
}
