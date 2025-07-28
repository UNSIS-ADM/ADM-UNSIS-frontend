import { Component, OnInit, Inject } from '@angular/core';
import {ExcelServiceResultados, ExcelUploadResponse } from '../services/excel.service';
import { NavComponent } from '../nav/nav.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule, NgClass } from '@angular/common';
import { ResultadosService } from '../services/resultados.service';

@Component({
  selector: 'app-carga-datos-resultados',
  standalone: true,
  imports: [
    NavComponent,
    FooterComponent,
    NgClass,
    CommonModule,
  ],
  templateUrl: './carga-datos-resultados.component.html',
  styleUrls: ['./carga-datos-resultados.component.css'],
})
export class CargaDatosResultadosComponent implements OnInit {
  selectedFile: File | null = null;
  uploadResult: ExcelUploadResponse | null = null;
  datos: any[] = [];
  token = localStorage.getItem('token') || '';

  constructor(
    private excelService: ExcelServiceResultados,
    private resultadosService: ResultadosService // Inyectar el servicio
  ) {}

  ngOnInit() {
    this.loadResultados(); // Cargar los datos al inicializar el componente
  }

  loadResultados() {
    this.resultadosService.getResultados().subscribe({
      next: (resultados: any[]) => {
        this.datos = resultados;
      },
      error: (err: any) => {
        console.error('Error al cargar los resultados:', err);
        alert('Error al cargar los datos de resultados');
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
            this.loadResultados();
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