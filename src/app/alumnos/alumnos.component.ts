import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlumnosService } from '../services/alumnos.service'; // Asegúrate de que la ruta sea correcta
import { FiltradoService } from '../services/filtrado.service'; // Asegúrate de que la ruta sea correcta
import { FormsModule } from '@angular/forms';
import { TiempoRelativoPipe } from '../../tiempo-relativo.pipe';


@Component({
  selector: 'app-alumnos',
  standalone: true,
  imports: [CommonModule, FormsModule,TiempoRelativoPipe],
  templateUrl: './alumnos.component.html',
  styleUrls: ['./alumnos.component.css']
})
export class AlumnosComponent implements OnInit {
  alumnos: any[] = [];
  filteredData: any[] = [];
  terminoBusqueda = '';
  buscando = false;
  errorBusqueda = false;
  // Paginación
  currentPage = 1;
  itemsPerPage = 5;
  Math = Math;




  constructor(@Inject(AlumnosService)
  private readonly alumnosService: AlumnosService,
    private filtradoService: FiltradoService,) { }

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
    const termino = this.terminoBusqueda.trim();
    if (!termino) {
      this.filteredData = [...this.alumnos];
      this.errorBusqueda = false;
      this.currentPage = 1;
      return;
    }

    this.buscando = true;
    this.errorBusqueda = false;

    // Detectar tipo automáticamente
    let tipo: 'ficha' | 'curp' | 'fullName' | 'career';
    if (/^\d/.test(termino)) tipo = 'ficha'; // empieza con número → ficha
    else if (this.alumnos.some(a => a.career?.toLowerCase().includes(termino.toLowerCase()))) tipo = 'career';
    else tipo = 'fullName';



    // Buscar remotamente
    setTimeout(() => {
      this.filtradoService.buscar(termino, tipo).subscribe({
        next: (resultados) => {
          if (resultados.length > 0) {
            this.filteredData = resultados;
            this.errorBusqueda = false;
          } else {
            this.filtrarLocalmente(termino, tipo);
          }
          this.currentPage = 1;
          this.buscando = false;
        },
        error: () => {
          this.filtrarLocalmente(termino, tipo);
          this.buscando = false;
        }
      });
    }, 300);
  }

  private filtrarLocalmente(termino: string, tipo: 'ficha' | 'curp' | 'fullName' | 'career') {
    termino = termino.toLowerCase();
    this.filteredData = this.alumnos.filter(alumno => {
      switch (tipo) {
        case 'fullName': return alumno.fullName?.toLowerCase().includes(termino);
        case 'ficha': return alumno.applicantId?.toString().toLowerCase().includes(termino);
        case 'curp': return alumno.curp?.toLowerCase().includes(termino);
        case 'career': return alumno.career?.toLowerCase().includes(termino);
      }
    });
    this.errorBusqueda = this.filteredData.length === 0;
  }
  //paginación 
  get paginatedData() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredData.slice(start, end);
  }
  siguientePagina() {
    if ((this.currentPage * this.itemsPerPage) < this.filteredData.length) {
      this.currentPage++;
    }
  }

  paginaAnterior() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  get totalPages(): number {
  return Math.ceil(this.filteredData.length / this.itemsPerPage);
    }
  get pages(): (number | string)[] {
  const total = this.totalPages;
  const current = this.currentPage;
  const delta = 1; // cantidad de páginas alrededor de la actual

  const range: (number | string)[] = [];
  const rangeWithDots: (number | string)[] = [];
  let last: number | undefined;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (last !== undefined && typeof i === 'number') {
      if ((i as number) - last === 2) {
        rangeWithDots.push(last + 1);
      } else if ((i as number) - last > 2) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    last = i as number;
  }

  return rangeWithDots;
}

goToPage(page: number) {
  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page;
  }
}
get emptyRows(): any[] {
  const rowsOnPage = this.paginatedData.length;
  if (rowsOnPage > 0 && rowsOnPage < this.itemsPerPage) {
    return Array(this.itemsPerPage - rowsOnPage);
  }
  return [];
}

}
