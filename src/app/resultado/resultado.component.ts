import { Component, OnInit } from '@angular/core';
import { NavComponent } from "../nav/nav.component";
import { MatCardModule } from '@angular/material/card';
import { FooterComponent } from "../footer/footer.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resultado',
  imports: [NavComponent, MatCardModule, FooterComponent, CommonModule],
  templateUrl: './resultado.component.html',
  styleUrls: ['./resultado.component.css']
})
export class ResultadoComponent implements OnInit {
  alumno = {
    nombre: 'Juan Pérez',
    matricula: '20231234',
    carrera: 'INFORMÁTICA', 
    aprobado: 'Reprobado'  // puedes cambiar esto según la lógica de tu aplicación
  };

  constructor() { }
  ngOnInit(): void {
   // Aquí puedes realizar cualquier inicialización necesaria
  }
}
