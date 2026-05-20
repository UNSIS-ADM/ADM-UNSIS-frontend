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
  alumnos: any[] = []; // Lista completa de alumnos desde el backend
  filteredData: any[] = []; // Lista filtrada según los selects

  // --- Búsqueda (no implementada completamente) ---
  terminoBusqueda = '';
  buscando = false;
  errorBusqueda = false;
  isLoading = false;
  
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
  roles: string[] = [];
  
  totalElements = 0;
  totalPagesBackend = 0;

  constructor(
    @Inject(AlumnosService) private readonly alumnosService: AlumnosService,
    //private filtradoService: FiltradoService,
    private cdRef: ChangeDetectorRef,
    private templateService: TemplateService, // Servicio para descarga de XLSX
    private alertService: AlertService,
  ) {
    const user = JSON.parse(localStorage.getItem('user_info') || '{}');
    this.roles = user.roles || [];
  }

  /**
   * Inicializa el componente:
   * - Genera lista de años
   * - Obtiene alumnos desde el servicio
   * - Llena listas de carreras y estatus
   */
  ngOnInit(): void {
    this.generarAnios();
    this.cargarAlumnos();
  }

  /**
   * CORRECCIÓN: Si estás realizando una búsqueda local o aplicando un filtro sobre 
   * el set de datos mutados, aplicamos .slice() para que la tabla conserve estrictamente 
   * el límite de 5 registros en pantalla.
   */
  get paginatedData() {
    // Si la búsqueda manual o el filtrado por select dejó un arreglo grande en el cliente, lo limitamos
    if (this.filteredData.length > this.itemsPerPage) {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredData.slice(startIndex, startIndex + this.itemsPerPage);
    }
    return this.filteredData;
  }

  siguientePagina() {
    // CORRECCIÓN: Quitamos el "return;" prematuro para permitir paginar los resultados locales de la búsqueda
    const totalPaginasEfectivas = this.terminoBusqueda.trim() 
      ? Math.ceil(this.filteredData.length / this.itemsPerPage) 
      : this.totalPagesBackend;

    if (this.currentPage < totalPaginasEfectivas) {
      this.currentPage++;
      if (!this.terminoBusqueda.trim()) {
        this.cargarAlumnos();
      } else {
        this.cdRef.detectChanges();
      }
    }
  }

  paginaAnterior() {
    if (this.currentPage > 1) {
      this.currentPage--;
      if (!this.terminoBusqueda.trim()) {
        this.cargarAlumnos();
      } else {
        this.cdRef.detectChanges();
      }
    }
  }

  cargarAlumnos(): void {
    this.alumnosService
      .getAlumnos(this.currentPage - 1, this.itemsPerPage)
      .subscribe({
        next: (data) => {
          this.alumnos = data.content.map((a: any) => ({
            ...a,
            attendanceStatus: a.attendanceStatus
              ? a.attendanceStatus.trim().toUpperCase()
              : '',
          }));

          this.totalElements = data.totalElements;
          this.totalPagesBackend = data.totalPages;

          this.carrerasDisponibles = [
            ...new Set(this.alumnos.map((a) => a.career).filter(Boolean)),
          ].sort();

          this.statusesDisponibles = [
            ...new Set(this.alumnos.map((a) => a.status).filter(Boolean)),
          ].sort();

          this.aplicarFiltros();
        },
        error: (err) => console.error(err),
      });
  }

  /**
   * Genera los últimos 5 años para el filtro "Año de admisión".
   */
  generarAnios() {
    const currentYear = new Date().getFullYear();
    this.aniosDisponibles = Array.from(
      { length: 5 },
      (_, i) => currentYear - i,
    );
    this.anioSeleccionado = currentYear.toString();
  }

  /**
   * Aplica filtros activos a la lista de alumnos.
   * Aplica filtros activos y búsqueda por texto a la lista de alumnos.
   */
  aplicarFiltros(resetPage: boolean = false) {
    if (resetPage) {
      this.currentPage = 1;
    }

    const busqueda = this.terminoBusqueda.toLowerCase().trim();

    this.filteredData = this.alumnos.filter((a) => {
      const coincideAnio =
        !this.anioSeleccionado || a.admissionYear == this.anioSeleccionado;

      const coincideCarrera =
        !this.carreraSeleccionada || a.career == this.carreraSeleccionada;

      const coincideStatus =
        !this.statusSeleccionado || a.status == this.statusSeleccionado;

      const coincideBusqueda =
        !busqueda ||
        (a.fullName && a.fullName.toLowerCase().includes(busqueda)) ||
        (a.curp && a.curp.toLowerCase().includes(busqueda)) ||
        (a.ficha && a.ficha.toString().includes(busqueda));

      return (
        coincideAnio && coincideCarrera && coincideStatus && coincideBusqueda
      );
    });

    this.cdRef.detectChanges();
  }

  // Método para el evento input del buscador
  onSearch() {
    const termino = this.terminoBusqueda.trim();

    // Si está vacío, vuelve a cargar paginación normal
    if (!termino) {
      this.currentPage = 1;
      this.cargarAlumnos();
      return;
    }

    this.buscando = true;

    // Construimos parámetros dinámicamente
    const params: any = {};

    // Si es número -> buscar por ficha
    if (!isNaN(Number(termino))) {
      params.ficha = Number(termino);
    }

    // Buscar también por texto
    params.fullName = termino;
    params.curp = termino;

    this.alumnosService.searchAlumnos(params).subscribe({
      next: (data) => {
        this.alumnos = data.map((a: any) => ({
          ...a,
          attendanceStatus: a.attendanceStatus
            ? a.attendanceStatus.trim().toUpperCase()
            : '',
        }));

        this.aplicarFiltros();

        // CORRECCIÓN: Calculamos las páginas efectivas basándonos en los resultados de la búsqueda
        this.currentPage = 1;
        this.totalPagesBackend = Math.ceil(this.filteredData.length / this.itemsPerPage) || 1;

        this.buscando = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error en búsqueda:', err);
        this.buscando = false;
        this.errorBusqueda = true;
      },
    });
  }

  limpiarBusqueda() {
    this.terminoBusqueda = '';
    this.currentPage = 1;
    this.cargarAlumnos();
  }

  filtrarPorAnio() {
    this.aplicarFiltros(true);
  }

  filtrarPorCarrera() {
    this.aplicarFiltros(true);
  }

  filtrarPorStatus() {
    this.aplicarFiltros(true);
  }

  /**
   * Genera los números de página visibles (con puntos suspensivos).
   */
  get pages(): (number | string)[] {
    const total = this.totalPagesBackend;
    const current = this.currentPage;
    const delta = 3;

    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];

    let last: number | undefined;

    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= current - delta && i <= current + delta)
      ) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (last !== undefined && typeof i === 'number') {
        if (i - last === 2) {
          rangeWithDots.push(last + 1);
        } else if (i - last > 2) {
          rangeWithDots.push('...');
        }
      }

      rangeWithDots.push(i);
      last = i as number;
    }

    return rangeWithDots;
  }

  goToPage(page: number) {
    // CORRECCIÓN: Habilitamos navegación por clics numéricos en búsquedas locales
    if (page >= 1 && page <= this.totalPagesBackend) {
      this.currentPage = page;
      if (!this.terminoBusqueda.trim()) {
        this.cargarAlumnos();
      } else {
        this.cdRef.detectChanges();
      }
    }
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

    this.alumnosService
      .marcarAsistencia(alumno.id, { status: nuevoEstado })
      .subscribe({
        next: () => {
          alumno.attendanceStatus = nuevoEstado;
          alumno.showReset = true; // Mostramos la X

          // LIMPIEZA DE TIMER PREVIO
          if (alumno.timerRef) {
            clearTimeout(alumno.timerRef);
          }

          // CONFIGURACIÓN DEL TIMER: 5 minutos
          alumno.timerRef = setTimeout(() => {
            alumno.showReset = false;
            this.cdRef.detectChanges();
          }, 300000);

          this.cdRef.detectChanges();
        },
        error: () =>
          this.alertService.showAlert(
            'Error al marcar la asistencia',
            'danger',
          ),
      });
  }

  resetearAsistencia(alumno: any): void {
    if (alumno.timerRef) {
      clearTimeout(alumno.timerRef);
      alumno.timerRef = null;
    }

    this.alumnosService
      .marcarAsistencia(alumno.id, { status: 'PENDIENTE' })
      .subscribe({
        next: () => {
          alumno.attendanceStatus = '';
          alumno.showReset = false;
          this.cdRef.detectChanges();
          console.log(alumno.status);
        },
        error: () => {
          alumno.attendanceStatus = '';
          alumno.showReset = false;
          this.cdRef.detectChanges();
        },
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
      key === 'aspirantes'
        ? 'Datos de aspirantes.xlsx'
        : 'Resultados de admisión.xlsx';

    this.templateService
      .downloadTemplate(key)
      .pipe(
        finalize(() => {
          this.downloadingAspirantes = false;
          this.downloadingResultados = false;
        }),
      )
      .subscribe({
        next: (res: HttpResponse<Blob>) => {
          const blob = res.body!;
          const filename = extractFilename(
            res.headers.get('content-disposition'),
            defaultName,
          );

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
          alert(
            'Error al descargar el formato. Revisa permisos o el servidor.',
          );
        },
      });
  }

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }
}