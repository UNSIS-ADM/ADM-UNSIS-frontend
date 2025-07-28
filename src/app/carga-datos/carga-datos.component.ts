import { Component, OnInit } from '@angular/core';
import { ExcelServiceApplicants, ExcelUploadResponse } from '../services/excel.service';
import { NavComponent } from '../nav/nav.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule, NgClass } from '@angular/common';
import { AlumnosService } from '../services/alumnos.service'; // Importar el servicio

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

  constructor(
    private excelService: ExcelServiceApplicants,
    private alumnosService: AlumnosService // Inyectar el servicio
  ) {}

  ngOnInit() {
    this.loadAlumnos(); // Cargar los datos al inicializar el componente
  }

  loadAlumnos() {
    this.alumnosService.getAlumnos().subscribe({
      next: (alumnos) => {
        this.datos = alumnos;
      },
      error: (err) => {
        console.error('Error al cargar alumnos:', err);
        alert('Error al cargar los datos de alumnos');
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

    this.excelService
      .uploadApplicants(this.selectedFile, this.token)
      .subscribe({
        next: (res) => {
          this.uploadResult = res;
          // Recargar los datos después de una carga exitosa
          if (res.success) {
            this.loadAlumnos();
          }
          setTimeout(() => (this.uploadResult = null), 5000);
        },
        error: (err) => {
          console.error(err);
          alert('Error al subir el Excel');
          this.uploadResult = {
            success: false,
            message: 'No se pudo subir el archivo. Intenta de nuevo.',
            errors: [],
          };
        },
      });
  }
}