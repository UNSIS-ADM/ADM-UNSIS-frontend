import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TiempoRelativoPipe } from '../../tiempo-relativo.pipe';
import { ExcelServiceResultados, ExcelUploadResponse } from '../services/excel.service';
import { ResultadosService } from '../services/resultados.service';
import { FiltradoService } from '../services/filtrado.service';
import { AlertService } from '../services/alert.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { RegistroFichasService } from '../services/registro-fichas.service';

@Component({
  selector: 'app-carga-datos-resultados',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TiempoRelativoPipe,
    ConfirmDialogComponent
  ],
  templateUrl: './carga-datos-resultados.component.html',
  styleUrls: ['./carga-datos-resultados.component.css'],
})
export class CargaDatosResultadosComponent implements OnInit {

  selectedFile: File | null = null;
  fileToConfirm: File | null = null;
  showConfirm: boolean = false;
  uploadResult: ExcelUploadResponse | null = null;
  datos: any[] = [];
  filteredData: any[] = [];
  token = localStorage.getItem('token') || '';
  isLoading = false;
  terminoBusqueda = '';
  buscando = false;
  errorBusqueda = false;
  currentPage = 1;
  itemsPerPage = 5;
  Math = Math;
  // 👇 agrega estas dos propiedades
 public anioSeleccionado: string = ''; // año actualmente seleccionado
  public aniosDisponibles: number[] = []; // lista de años únicos disponibles

  
  constructor(
    private excelService: ExcelServiceResultados,
    private resultadosService: ResultadosService,
    private filtradoService: FiltradoService,
    private cdRef: ChangeDetectorRef,
    private alertService: AlertService,
    private router: Router,
    private registroFichasService: RegistroFichasService  
  ) { }

  ngOnInit() {
      this.generarAnios();  
    this.loadResultados();
  }
loadResultados() {
  this.isLoading = true;
  this.cdRef.detectChanges();

  this.resultadosService.getResultados().subscribe({
    next: (resultados) => {
      this.datos = resultados;
      this.filteredData = [...this.datos];

      // 🔹 años que vienen del endpoint
      const yearsFromEndpoint = this.datos.map(a => a.admissionYear);

      // 🔹 años desde el actual hasta 5 atrás
      const currentYear = new Date().getFullYear();
      const lastFiveYears = Array.from({length:5},(_,i)=>currentYear - i);

      // 🔹 combinas ambos
      this.aniosDisponibles = [...new Set([...yearsFromEndpoint, ...lastFiveYears])]
        .sort((a,b)=>b-a);

      // 🔹 seleccionar año actual automáticamente
      this.anioSeleccionado = currentYear.toString();

      // 🔹 filtrar para mostrar solo ese año al cargar
      this.filtrarPorAnio();

      this.isLoading = false;
      this.cdRef.detectChanges();
    },
    error: (err) => {
      this.alertService.showAlert('Error al cargar los datos', 'danger');
      this.isLoading = false;
      this.cdRef.detectChanges();
    }
  });
}



  buscar() {
    const termino = this.terminoBusqueda.trim();
    if (!termino) {
      this.filteredData = [...this.datos];
      this.errorBusqueda = false;
      this.currentPage = 1;
      return;
    }

    this.buscando = true;
    this.errorBusqueda = false;

    let tipo: 'ficha' | 'curp' | 'fullName' | 'career';
    if (/^\d/.test(termino)) tipo = 'ficha';
    else if (this.datos.some(a => a.career?.toLowerCase().includes(termino.toLowerCase()))) tipo = 'career';
    else tipo = 'fullName';

    setTimeout(() => {
      this.filtradoService.buscar(termino, tipo).subscribe({
        next: (resultados) => {
          if (resultados.length > 0) this.filteredData = resultados;
          else this.filtrarLocalmente(termino, tipo);
          this.currentPage = 1;
          this.buscando = false;
          this.cdRef.detectChanges();
        },
        error: () => {
          this.filtrarLocalmente(termino, tipo);
          this.buscando = false;
          this.cdRef.detectChanges();
        }
      });
    }, 300);
     this.filtrarPorAnio();
  }

  private filtrarLocalmente(termino: string, tipo: 'ficha' | 'curp' | 'fullName' | 'career') {
    termino = termino.toLowerCase();
    this.filteredData = this.datos.filter(alumno => {
      switch (tipo) {
        case 'fullName': return alumno.fullName?.toLowerCase().includes(termino);
        case 'ficha': return alumno.applicantId?.toString().toLowerCase().includes(termino);
        case 'curp': return alumno.curp?.toLowerCase().includes(termino);
        case 'career': return alumno.career?.toLowerCase().includes(termino);
      }
    });
    this.errorBusqueda = this.filteredData.length === 0;
  }
  private generarAnios() {
  const currentYear = new Date().getFullYear();
  this.aniosDisponibles = [];
  for (let i = 0; i < 5; i++) {
    this.aniosDisponibles.push(currentYear - i);
  }
}

filtrarPorAnio() {
  if (!this.anioSeleccionado) {
    this.filteredData = [...this.datos];
  } else {
    const year = +this.anioSeleccionado;
    // 🔹 filtrar usando admissionYear
    this.filteredData = this.datos.filter(a => a.admissionYear === year);
  }
  this.currentPage = 1;
}
  onFileSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.fileToConfirm = input.files[0];
      this.showConfirm = true;
      input.value = '';
    }
  }

  onConfirm(result: boolean) {
    this.showConfirm = false;

    if (result && this.fileToConfirm) {
      this.selectedFile = this.fileToConfirm;
      this.isLoading = true;
      this.cdRef.detectChanges();
      this.alertService.showAlert(`Archivo "${this.fileToConfirm.name}" seleccionado.`, 'info');
      this.uploadExcel();
    }

    this.fileToConfirm = null;
  }

  uploadExcel() {
    if (!this.selectedFile) {
      this.alertService.showAlert('No hay archivo seleccionado', 'warning');
      return;
    }

    this.isLoading = true;
    this.cdRef.detectChanges();

    this.excelService.uploadApplicants(this.selectedFile, this.token).subscribe({
      next: (res) => {
        this.uploadResult = res;

        if (res.success) {
          this.loadResultados();
          this.alertService.showAlert('Datos cargados exitosamente', 'success');
        } else {
          this.alertService.showAlert(res.message || 'Error al procesar el archivo', 'danger');
        }

        this.isLoading = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.uploadResult = {
          success: false,
          message: 'No se pudo subir el archivo. Intenta de nuevo.',
          errors: [],
        };
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
    });
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
}
