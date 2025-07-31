import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../nav/nav.component';
import { FooterComponent } from '../footer/footer.component';
import { AlumnosService } from '../services/alumnos.service'; // Asegúrate de que la ruta sea correcta
import { FiltradoService } from '../services/filtrado.service'; // Asegúrate de que la ruta sea correcta
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-alumnos',
  standalone: true,
  imports: [CommonModule, NavComponent, FooterComponent, FormsModule],
  templateUrl: './alumnos.component.html',
  styleUrls: ['./alumnos.component.css']
})
export class AlumnosComponent implements OnInit {
  alumnos: any[] = [];
   filteredData: any[] = [];
    terminoBusqueda = '';
    buscando = false;
  errorBusqueda = false;

  constructor(@Inject(AlumnosService) 
  private readonly alumnosService: AlumnosService,
    private filtradoService: FiltradoService,) {}

ngOnInit(): void {
  this.alumnosService.getAlumnos().subscribe({
    next: (data) => {
      this.alumnos = data;
      this.filteredData = [...this.alumnos]; // <-- ¡Aquí es donde lo necesitabas!

      if (this.alumnos.length > 0) {
        console.log('Primer alumno:', this.alumnos[0]);
      } else {
        console.log('No se recibieron alumnos');
      }
    },
    error: (err) => console.error('Error al cargar alumnos', err)
  });
}
buscar() {
  if (!this.terminoBusqueda.trim()) {
    this.filteredData = [...this.alumnos];
    this.errorBusqueda = false;
    return;
  }

  this.buscando = true;
  this.errorBusqueda = false;

  setTimeout(() => {
    this.filtradoService.buscar(this.terminoBusqueda).subscribe({
      next: (resultados) => {
        // Si el backend responde con resultados, úsalos; 
        // si no, cae al filtrado local
        if (resultados.length > 0) {
          this.filteredData = resultados;
          this.errorBusqueda = false;
        } else {
          this.filtrarLocalmente();
        }
        this.buscando = false;
      },
      error: () => {
        this.filtrarLocalmente();
        this.buscando = false;
      }
    });
  }, 300);
}

private filtrarLocalmente() {
  const termino = this.terminoBusqueda.toLowerCase();
  this.filteredData = this.alumnos.filter(alumno => {
    return (
      alumno.applicantId?.toString().toLowerCase().includes(termino) ||
      alumno.fullName?.toLowerCase().includes(termino) ||
      alumno.career?.toLowerCase().includes(termino) ||
      alumno.curp?.toLowerCase().includes(termino)  // Asegúrate de que la propiedad coincida con tu modelo
    );
  });
  this.errorBusqueda = this.filteredData.length === 0;
}

}
