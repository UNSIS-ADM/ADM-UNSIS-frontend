import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ExcelServiceResultados, ExcelUploadResponse } from '../services/excel.service';
import { NavComponent } from '../nav/nav.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { ResultadosService } from '../services/resultados.service';
import { FormsModule } from '@angular/forms';
import { FiltradoService } from '../services/filtrado.service';
import { TiempoRelativoPipe } from '../../tiempo-relativo.pipe';

@Component({
  selector: 'app-carga-datos-resultados',
  standalone: true,
  imports: [
    NavComponent,
    FooterComponent,
    CommonModule,
    FormsModule,
    TiempoRelativoPipe
  ],
  templateUrl: './carga-datos-resultados.component.html',
  styleUrls: ['./carga-datos-resultados.component.css'],
})
export class CargaDatosResultadosComponent implements OnInit {
  selectedFile: File | null = null;
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
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadResultados();
  }

  loadResultados() {
    this.isLoading = true;
    this.resultadosService.getResultados().subscribe({
      next: (resultados) => {
        this.datos = resultados;
        this.filteredData = [...this.datos];
        console.log('Resultados cargados:', this.datos);
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.isLoading = false;
        this.cdRef.detectChanges();
      }
    });
  }


  buscar() {
    if (!this.terminoBusqueda.trim()) {
      this.filteredData = [...this.datos];
      this.errorBusqueda = false;
      this.currentPage = 1;
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
           this.currentPage = 1;
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
    this.filteredData = this.datos.filter(alumno => {
      return (
        alumno.ficha?.toString().toLowerCase().includes(termino) ||
        alumno.fullName?.toLowerCase().includes(termino) ||
        alumno.career?.toLowerCase().includes(termino) ||
        alumno.curp?.toLowerCase().includes(termino)  // Asegúrate de que la propiedad coincida con tu modelo
      );
    });
    this.errorBusqueda = this.filteredData.length === 0;
  }


  onFileSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];

      const confirmed = window.confirm(
        `¿Estás seguro de subir el archivo "${file.name}"?`
      );

      if (confirmed) {
        this.selectedFile = file;
        this.isLoading = true;
        this.cdRef.detectChanges();
        this.uploadExcel();
      } else {
        input.value = '';
        this.selectedFile = null;
      }
    }
  }

  uploadExcel() {
    if (!this.selectedFile) {
      alert('Selecciona primero un archivo .xlsx');
      return;
    }

    this.isLoading = true;
    this.cdRef.detectChanges();

    this.excelService.uploadApplicants(this.selectedFile, this.token).subscribe({
      next: (res) => {
        this.uploadResult = res;
        if (res.success) {
          this.loadResultados();
        } else {
          this.isLoading = false;
          this.cdRef.detectChanges();
        }
        setTimeout(() => (this.uploadResult = null), 5000);
      },
      error: (err) => {
        console.error(err);
        alert('Error al subir el Excel');
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

}