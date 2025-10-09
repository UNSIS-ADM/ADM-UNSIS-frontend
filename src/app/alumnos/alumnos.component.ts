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

  // 🔍 Búsqueda
  terminoBusqueda = '';
  buscando = false;
  errorBusqueda = false;

  // 🔹 Paginación
  currentPage = 1;
  itemsPerPage = 5;
  Math = Math;

  // 🔹 Filtros
  aniosDisponibles: number[] = [];
  anioSeleccionado: string = '';
  carreraSeleccionada: string = '';
  statusSeleccionado: string = '';
  carrerasDisponibles: string[] = [];
  statusesDisponibles: string[] = [];

  constructor(
    @Inject(AlumnosService) private readonly alumnosService: AlumnosService,
    private filtradoService: FiltradoService,
    private cdRef: ChangeDetectorRef
  ) {}

ngOnInit(): void {
  this.generarAnios();
  this.alumnosService.getAlumnos().subscribe({
  next: (data) => {
    this.alumnos = data.map(a => ({
      ...a,
      // normaliza el estado: ASISTIO, NP o vacío
      AttendanceStatus: a.attendanceStatus ? a.attendanceStatus.trim().toUpperCase() : ''
    }));

    // llenar select de carreras y status
    this.carrerasDisponibles = [...new Set(this.alumnos.map(a => a.career).filter(Boolean))].sort();
    this.statusesDisponibles = [...new Set(this.alumnos.map(a => a.status).filter(Boolean))].sort();

    this.aplicarFiltros();
  },
  error: (err) => console.error('Error al cargar alumnos', err)
});
}

  // --- Generar lista de años ---
  generarAnios() {
    const currentYear = new Date().getFullYear();
    this.aniosDisponibles = Array.from({ length: 5 }, (_, i) => currentYear - i);
    this.anioSeleccionado = currentYear.toString();
  }

  // --- Aplicar filtros ---
  aplicarFiltros() {
    this.filteredData = this.alumnos.filter(a => {
      const coincideAnio = !this.anioSeleccionado || a.admissionYear == this.anioSeleccionado;
      const coincideCarrera = !this.carreraSeleccionada || a.career == this.carreraSeleccionada;
      const coincideStatus = !this.statusSeleccionado || a.status == this.statusSeleccionado;
      return coincideAnio && coincideCarrera && coincideStatus;
    });

    this.currentPage = 1;
    this.cdRef.detectChanges();
  }

  filtrarPorAnio() {
    this.aplicarFiltros();
  }

  filtrarPorCarrera() {
    this.aplicarFiltros();
  }

  filtrarPorStatus() {
    this.aplicarFiltros();
  }

  // --- Paginación ---
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
marcarAsistencia(alumno: any, asistio: boolean): void {
  const nuevoEstado = asistio ? 'ASISTIÓ' : 'NP';
  this.alumnosService.marcarAsistencia(alumno.id, { status: nuevoEstado }).subscribe({
    next: () => {
      alumno.attendanceStatus = nuevoEstado;
      this.cdRef.detectChanges(); // fuerza actualización visual
    },
    error: (error) => console.error('Error al actualizar asistencia', error)
  });
}

}
