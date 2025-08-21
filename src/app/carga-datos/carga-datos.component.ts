import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TiempoRelativoPipe } from '../../tiempo-relativo.pipe';
import { ExcelServiceApplicants, ExcelUploadResponse } from '../services/excel.service';
import { AlumnosService } from '../services/alumnos.service';
import { FiltradoService } from '../services/filtrado.service';
import { AlertService } from '../services/alert.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-carga-datos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TiempoRelativoPipe,
    ConfirmDialogComponent
  ],
  templateUrl: './carga-datos.component.html',
  styleUrls: ['./carga-datos.component.css'],
})
export class CargaDatosComponent implements OnInit {
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
  constructor(
    private excelService: ExcelServiceApplicants,
    private alumnosService: AlumnosService,
    private filtradoService: FiltradoService,
    private cdRef: ChangeDetectorRef,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.loadAlumnos();
  }

  loadAlumnos() {
    this.isLoading = true;
    this.alumnosService.getAlumnos().subscribe({
      next: (resultados) => {
        this.datos = resultados;
        this.filteredData = [...this.datos];
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
      error: () => {
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

    // Detectar tipo automáticamente
    let tipo: 'ficha' | 'curp' | 'fullName' | 'career';
    if (/^\d/.test(termino)) tipo = 'ficha'; // empieza con número → ficha
    else if (this.datos.some(a => a.career?.toLowerCase().includes(termino.toLowerCase()))) tipo = 'career';
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
      this.alertService.showAlert('Selecciona primero un archivo .xlsx', 'warning');
      return;
    }

    this.isLoading = true;
    this.cdRef.detectChanges();

    this.excelService.uploadApplicants(this.selectedFile, this.token).subscribe({
      next: (res) => {
        this.uploadResult = res;
        if (res.success) {
          this.loadAlumnos();
        } else {
          this.isLoading = false;
          this.cdRef.detectChanges();
        }
        setTimeout(() => (this.uploadResult = null), 5000);
      },
      error: (err) => {
        console.error(err);
        this.alertService.showAlert('Error al subir el archivo', 'danger');
        this.isLoading = false;
        this.cdRef.detectChanges();
        this.uploadResult = {
          success: false,
          message: 'No se pudo subir el archivo. Intenta de nuevo.',
          errors: [],
        };
      },
    });
  }

  // Paginación
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
}
