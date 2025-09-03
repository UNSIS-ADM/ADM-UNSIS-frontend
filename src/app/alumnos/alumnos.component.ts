import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlumnosService } from '../services/alumnos.service';
import { FiltradoService } from '../services/filtrado.service';
import { TiempoRelativoPipe } from '../../tiempo-relativo.pipe';

@Component({
  selector: 'app-alumnos',
  standalone: true,
  imports: [CommonModule, FormsModule, TiempoRelativoPipe],
  templateUrl: './alumnos.component.html',
  styleUrls: ['./alumnos.component.css']
})
export class AlumnosComponent implements OnInit {
  alumnos: any[] = [];
  filteredData: any[] = [];
  terminoBusqueda = '';
  buscando = false;
  errorBusqueda = false;

  // paginación
  currentPage = 1;
  itemsPerPage = 5;
  Math = Math;

  // 🔹 nuevo para años
  aniosDisponibles: number[] = [];
  anioSeleccionado: string = '';

  constructor(
    @Inject(AlumnosService) private readonly alumnosService: AlumnosService,
    private filtradoService: FiltradoService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.generarAnios();
    this.alumnosService.getAlumnos().subscribe({
      next: (data) => {
        this.alumnos = data;
        this.filtrarPorAnio();
      },
      error: (err) => console.error('Error al cargar alumnos', err)
    });
  }

  private generarAnios() {
    const currentYear = new Date().getFullYear();
    this.aniosDisponibles = Array.from({ length: 5 }, (_, i) => currentYear - i);
    this.anioSeleccionado = currentYear.toString();
  }

  filtrarPorAnio() {
    if (!this.anioSeleccionado) {
      this.filteredData = [...this.alumnos];
    } else {
      const year = +this.anioSeleccionado;
      this.filteredData = this.alumnos.filter(a => a.admissionYear === year);
    }
    this.currentPage = 1;
    this.cdRef.detectChanges();
  }

  buscar() {
    const termino = this.terminoBusqueda.trim();
    if (!termino) {
      this.filtrarPorAnio();
      this.errorBusqueda = false;
      this.currentPage = 1;
      return;
    }

    this.buscando = true;
    this.errorBusqueda = false;

    let tipo: 'ficha' | 'curp' | 'fullName' | 'career';
    if (/^\d/.test(termino)) tipo = 'ficha';
    else if (this.alumnos.some(a => a.career?.toLowerCase().includes(termino.toLowerCase()))) tipo = 'career';
    else tipo = 'fullName';

    setTimeout(() => {
      this.filtradoService.buscar(termino, tipo).subscribe({
        next: (resultados) => {
          this.filteredData = resultados.length > 0 ? resultados : this.filtrarLocalmente(termino, tipo);
          this.filtrarPorAnio();
          this.currentPage = 1;
          this.buscando = false;
          this.cdRef.detectChanges();
        },
        error: () => {
          this.filtrarLocalmente(termino, tipo);
          this.filtrarPorAnio();
          this.buscando = false;
          this.cdRef.detectChanges();
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
    return this.filteredData;
  }

  // paginación
  get paginatedData() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredData.slice(start, end);
  }
  siguientePagina() {
    if ((this.currentPage * this.itemsPerPage) < this.filteredData.length) this.currentPage++;
  }
  paginaAnterior() {
    if (this.currentPage > 1) this.currentPage--;
  }
  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.itemsPerPage);
  }
  get pages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 1;
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];
    let last: number | undefined;

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) range.push(i);
    }

    for (let i of range) {
      if (last !== undefined && typeof i === 'number') {
        if ((i as number) - last === 2) rangeWithDots.push(last + 1);
        else if ((i as number) - last > 2) rangeWithDots.push('...');
      }
      rangeWithDots.push(i);
      last = i as number;
    }

    return rangeWithDots;
  }
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }
  get emptyRows(): any[] {
    const rowsOnPage = this.paginatedData.length;
    if (rowsOnPage > 0 && rowsOnPage < this.itemsPerPage) return Array(this.itemsPerPage - rowsOnPage);
    return [];
  }
}
