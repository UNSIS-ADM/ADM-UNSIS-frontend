import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavComponent } from '../nav/nav.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-solicitud-carrera-estudiante',
  imports: [CommonModule,FormsModule,NavComponent,FooterComponent],
  templateUrl: './solicitud-carrera-estudiante.component.html',
  styleUrls: ['./solicitud-carrera-estudiante.component.css']
})
export class SolicitudCarreraEstudianteComponent implements OnInit {

  solicitud = {
    matricula: '12345678',
    carreraActual: 'Ingeniería en Sistemas',
    nuevaCarrera: 'Ingeniería en Electrónica',
    comentario: 'Me gustaría cambiarme por afinidad a la electrónica.'
  };

  comentarioSecretaria: string = '';

  constructor() { }

  ngOnInit(): void { }

}
