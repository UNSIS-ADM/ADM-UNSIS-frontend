import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ExcelServiceApplicants, ExcelUploadResponse } from '../services/excel.service';
import { NavComponent } from '../nav/nav.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule, NgClass } from '@angular/common';
import { AlumnosService } from '../services/alumnos.service';

@Component({
  selector: 'app-carga-datos',
  standalone: true,
  imports: [
    NavComponent,
    FooterComponent,
    NgClass,
    CommonModule,
  ],
  templateUrl: './carga-datos.component.html',
  styleUrls: ['./carga-datos.component.css'],
})
export class CargaDatosComponent implements OnInit {
  selectedFile: File | null = null;
  uploadResult: ExcelUploadResponse | null = null;
  datos: any[] = [];
  token = localStorage.getItem('token') || '';
  isLoading = false;

  constructor(
    private excelService: ExcelServiceApplicants,
    private alumnosService: AlumnosService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAlumnos();
  }

  loadAlumnos() {
    this.isLoading = true;
    this.cdRef.detectChanges(); // Forzar detección de cambios
    
    this.alumnosService.getAlumnos().subscribe({
      next: (alumnos) => {
        this.datos = alumnos;
        console.log('Alumnos cargados:', this.datos);
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar alumnos:', err);
        alert('Error al cargar los datos de alumnos');
        this.isLoading = false;
        this.cdRef.detectChanges();
      }
    });
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
        this.isLoading = true; // Activar loader antes de subir
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

    this.excelService.uploadApplicants(this.selectedFile, this.token)
      .subscribe({
        next: (res) => {
          this.uploadResult = res;
          if (res.success) {
            this.loadAlumnos(); // loadAlumnos ya maneja el isLoading
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
}