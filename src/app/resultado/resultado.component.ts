import { Component, OnInit } from '@angular/core';
import { NavComponent } from "../nav/nav.component";
import { MatCardModule } from '@angular/material/card';
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-resultado',
  imports: [NavComponent, MatCardModule, FooterComponent],
  templateUrl: './resultado.component.html',
  styleUrls: ['./resultado.component.css']
})
export class ResultadoComponent implements OnInit {
  alumno = {
    nombre: 'Juan Pérez',
    matricula: '20231234',
    carrera: 'Ingeniería en Sistemas',
    aprobado: true // puedes cambiar esto según la lógica de tu aplicación
  };

  constructor() { }

  ngOnInit(): void { }
}
