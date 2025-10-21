/**
 * Componente: AlumnosComponent
 * Descripción:
 * Este componente muestra y gestiona los datos de los aspirantes (alumnos).
 * Permite filtrar por año, carrera y estatus, marcar asistencia, paginar resultados
 * y descargar plantillas XLSX con los datos o resultados de admisión.
 */

import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlumnosService } from '../services/alumnos.service';
import { FiltradoService } from '../services/filtrado.service';
import { TiempoRelativoPipe } from '../../tiempo-relativo.pipe';
import { TemplateService } from '../services/template.service';
import { HttpResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { extractFilename } from '../utils/file--utils';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-alumnos',
  standalone: true,
  imports: [CommonModule, FormsModule, TiempoRelativoPipe],
  templateUrl: './alumnos.component.html',
  styleUrls: ['./alumnos.component.css'],
})
export class AlumnosComponent implements OnInit {
  // --- Estado de descarga de archivos ---
  downloadingAspirantes = false;
  downloadingResultados = false;

  // --- Listas de datos ---
  alumnos: any[] = [];         // Lista completa de alumnos desde el backend
  filteredData: any[] = [];    // Lista filtrada según los selects

  // --- Búsqueda (no implementada completamente) ---
  terminoBusqueda = '';
  buscando = false;
  errorBusqueda = false;

  // --- Paginación ---
  currentPage = 1;
  itemsPerPage = 5;
  Math = Math; // Permite usar Math en el template

  // --- Filtros disponibles y seleccionados ---
  aniosDisponibles: number[] = [];
  anioSeleccionado: string = '';
  carreraSeleccionada: string = '';
  statusSeleccionado: string = '';
  carrerasDisponibles: string[] = [];
  statusesDisponibles: string[] = [];

  constructor(
    @Inject(AlumnosService) private readonly alumnosService: AlumnosService,
    private filtradoService: FiltradoService,
    private cdRef: ChangeDetectorRef,
    private templateService: TemplateService, // Servicio para descarga de XLSX
    private alertService: AlertService,
  ) {}

  /**
   * Inicializa el componente:
   * - Genera lista de años
   * - Obtiene alumnos desde el servicio
   * - Llena listas de carreras y estatus
   */
  ngOnInit(): void {
    this.generarAnios();

    this.alumnosService.getAlumnos().subscribe({
      next: (data) => {
        // Normaliza datos obtenidos
        this.alumnos = data.map((a) => ({
          ...a,
          AttendanceStatus: a.attendanceStatus
            ? a.attendanceStatus.trim().toUpperCase()
            : '',
        }));

        console.log(this.alumnos);

        // Llena selects únicos de carrera y estatus
        this.carrerasDisponibles = [
          ...new Set(this.alumnos.map((a) => a.career).filter(Boolean)),
        ].sort();

        this.statusesDisponibles = [
          ...new Set(this.alumnos.map((a) => a.status).filter(Boolean)),
        ].sort();

        // Aplica filtros iniciales
        this.aplicarFiltros();
      },
      error: (err) => console.error('Error al cargar alumnos', err),
    });
  }

  /**
   * Genera los últimos 5 años para el filtro "Año de admisión".
   */
  generarAnios() {
    const currentYear = new Date().getFullYear();
    this.aniosDisponibles = Array.from({ length: 5 }, (_, i) => currentYear - i);
    this.anioSeleccionado = currentYear.toString();
  }

  /**
   * Aplica filtros activos a la lista de alumnos.
   */
  aplicarFiltros() {
    this.filteredData = this.alumnos.filter((a) => {
      const coincideAnio = !this.anioSeleccionado || a.admissionYear == this.anioSeleccionado;
      const coincideCarrera = !this.carreraSeleccionada || a.career == this.carreraSeleccionada;
      const coincideStatus = !this.statusSeleccionado || a.status == this.statusSeleccionado;
      return coincideAnio && coincideCarrera && coincideStatus;
    });

    this.currentPage = 1; // Reinicia paginación
    this.cdRef.detectChanges(); // Actualiza vista
  }

  filtrarPorAnio() { this.aplicarFiltros(); }
  filtrarPorCarrera() { this.aplicarFiltros(); }
  filtrarPorStatus() { this.aplicarFiltros(); }

  // --- Métodos de paginación ---

  get paginatedData() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredData.slice(start, end);
  }

  siguientePagina() {
    if (this.currentPage * this.itemsPerPage < this.filteredData.length)
      this.currentPage++;
  }

  paginaAnterior() {
    if (this.currentPage > 1) this.currentPage--;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.itemsPerPage);
  }

  /**
   * Genera los números de página visibles (con puntos suspensivos).
   */
  get pages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 1;
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];
    let last: number | undefined;

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta))
        range.push(i);
    }

    for (let i of range) {
      if (last !== undefined && typeof i === 'number') {
        if (i - last === 2) rangeWithDots.push(last + 1);
        else if (i - last > 2) rangeWithDots.push('...');
      }
      rangeWithDots.push(i);
      last = i as number;
    }

    return rangeWithDots;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  /**
   * Rellena filas vacías para mantener tamaño visual de la tabla.
   */
  get emptyRows(): any[] {
    const rowsOnPage = this.paginatedData.length;
    if (rowsOnPage > 0 && rowsOnPage < this.itemsPerPage)
      return Array(this.itemsPerPage - rowsOnPage);
    return [];
  }

  /**
   * Marca la asistencia de un alumno como "Asistió" o "NP".
   * Llama al backend y actualiza la tabla.
   */
  marcarAsistencia(alumno: any, asistio: boolean): void {
    const nuevoEstado = asistio ? 'ASISTIÓ' : 'NP';
    this.alumnosService.marcarAsistencia(alumno.id, { status: nuevoEstado }).subscribe({
      next: () => {
        alumno.attendanceStatus = nuevoEstado;
        this.cdRef.detectChanges();
      },
      error: () => this.alertService.showAlert('Error al marcar la asistencia', 'danger')
    });
  }

  /**
   * Descarga los formatos XLSX desde el servidor.
   * @param key Tipo de archivo a descargar ('aspirantes' o 'resultados')
   */
  downloadTemplate(key: 'aspirantes' | 'resultados'): void {
    if (key === 'aspirantes') this.downloadingAspirantes = true;
    else this.downloadingResultados = true;

    const defaultName =
      key === 'aspirantes' ? 'Datos de aspirantes.xlsx' : 'Resultados de admisión.xlsx';

    this.templateService
      .downloadTemplate(key)
      .pipe(
        finalize(() => {
          this.downloadingAspirantes = false;
          this.downloadingResultados = false;
        })
      )
      .subscribe({
        next: (res: HttpResponse<Blob>) => {
          const blob = res.body!;
          const filename = extractFilename(
            res.headers.get('content-disposition'),
            defaultName
          );

          // Crea un enlace invisible para descargar el archivo
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('Error descargando template', err);
          alert('Error al descargar el formato. Revisa permisos o el servidor.');
        },
      });
  }
}
