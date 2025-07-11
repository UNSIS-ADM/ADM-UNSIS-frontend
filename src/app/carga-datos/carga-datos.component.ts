import { Component } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ExcelService, ExcelUploadResponse} from '../services/excel.service';
import { NavComponent } from '../nav/nav.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule, NgClass } from '@angular/common';

@Component({
  selector: 'app-carga-datos',
  standalone: true,
  imports: [
    HttpClientModule,
    NavComponent,
    FooterComponent,
    NgClass,
    CommonModule,
  ],
  templateUrl: './carga-datos.component.html',
  styleUrls: ['./carga-datos.component.css'],
})
export class CargaDatosComponent {
  selectedFile: File | null = null;
  uploadResult: ExcelUploadResponse | null = null;
  datos: any[] = [];
  token = localStorage.getItem('token') || ''; // o como guardes tu token

  constructor(private excelService: ExcelService) {}

  onFileSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];

      // Mostrar confirmación antes de subir
      const confirmed = window.confirm(
        `¿Estás seguro de subir el archivo "${file.name}"?`
      );

      if (confirmed) {
        this.selectedFile = file;
        this.uploadExcel();
      } else {
        // Limpiar la selección para que pueda elegir otro archivo
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
          //this.datos = res.data || []; Descomentar despues de implementar el servicio para obtener los datos        setTimeout(() => (this.uploadResult = null), 5000); // Oculta después de 5s
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

