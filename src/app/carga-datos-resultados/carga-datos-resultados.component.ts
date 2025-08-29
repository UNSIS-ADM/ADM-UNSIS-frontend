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
    this.loadResultados();
  }

  loadResultados() {
    this.isLoading = true;

    this.resultadosService.getResultados().subscribe({

      next: (resultados) => {
        this.datos = resultados;
        console.log(this.datos);
        this.filteredData = [...this.datos];
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
    console.log(this.filteredData);
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
    // 👇 ejemplo: tomamos el año actual, puedes cambiarlo si tu app selecciona un año específico
    const anioActual = new Date().getFullYear();

    this.registroFichasService.obtenerVacantesPorAnio(anioActual).subscribe({
      next: (vacantes) => {
        if (!vacantes || vacantes.length === 0) {
          this.alertService.showAlert('No hay fichas registradas, primero debes registrar vacantes.', 'warning');
          this.router.navigate(['/aspirantes']);
          return;
        }

        // 👇 si sí hay vacantes → permitir selección de archivo
        const input = evt.target as HTMLInputElement;
        if (input.files && input.files.length) {
          this.fileToConfirm = input.files[0];
          this.showConfirm = true;
          input.value = '';
        }
      },
      error: (err) => {
        console.error(err);
        this.alertService.showAlert('Error al verificar vacantes', 'danger');
      }
    });
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
        // Mostrar el mensaje principal
        this.alertService.showAlert(res.message || 'Error al procesar el archivo', 'danger');

        // Si hay errores detallados, los mostramos concatenados
     
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
      //this.alertService.showAlert(this.uploadResult.message, 'danger');
      this.isLoading = false;
      this.cdRef.detectChanges();
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
