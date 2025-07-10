import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../nav/nav.component';
import { FooterComponent } from '../footer/footer.component';
import { AlumnosService } from '../services/alumnos.service'; // Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-alumnos',
  standalone: true,
  imports: [CommonModule, NavComponent, FooterComponent],
  templateUrl: './alumnos.component.html',
  styleUrls: ['./alumnos.component.css']
})
export class AlumnosComponent implements OnInit {
  alumnos: any[] = [];

  constructor(@Inject(AlumnosService) private readonly alumnosService: AlumnosService) {}

  ngOnInit(): void {
    this.alumnosService.getAlumnos().subscribe({
      next: (data) => {
        this.alumnos = data;
        if (this.alumnos.length > 0) {
          console.log('Primer alumno:', this.alumnos[0]);
        } else {
          console.log('No se recibieron alumnos');
        }
      },
      error: (err) => console.error('Error al cargar alumnos', err)
    });
  }
}
