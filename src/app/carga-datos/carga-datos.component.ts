
// src/app/components/alumnos/alumnos.component.ts
import { Component } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ExcelService, ExcelUploadResponse} from '../services/excel.service';
import { NavComponent } from '../nav/nav.component';
import { FooterComponent } from '../footer/footer.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-alumnos',
  standalone: true,
  imports: [HttpClientModule, NavComponent, FooterComponent, NgClass],
  templateUrl: './carga-datos.component.html',
  styleUrls: ['./carga-datos.component.css'],
})
export class CargaDatosComponentl {
  selectedFile: File | null = null;
  uploadResult: ExcelUploadResponse | null = null;
  token = localStorage.getItem('token') || ''; // o como guardes tu token

  constructor(private excelService: ExcelService) {}

  onFileSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
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
        next: (res) => (this.uploadResult = res),
        error: (err) => {
          console.error(err);
          alert('Error al subir el Excel');
        },
      });
  }
}
/*import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../nav/nav.component';
import { FooterComponent } from '../footer/footer.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-carga-datos',
  standalone: true,
  imports: [CommonModule, NavComponent, FooterComponent],
  templateUrl: './carga-datos.component.html',
  styleUrls: ['./carga-datos.component.css']
})
export class CargaDatosComponent implements OnInit {
  datos = [
    { id: 1, nombre: 'Juan Pérez', matricula: '2024001', carrera: 'Informática', fecha: '2024-06-04', estado: 'Cargado' },
    { id: 2, nombre: 'María López', matricula: '2024002', carrera: 'Sistemas', fecha: '2024-06-04', estado: 'Pendiente' },
    { id: 3, nombre: 'Carlos García', matricula: '2024003', carrera: 'Informática', fecha: '2024-06-04', estado: 'Cargado' },
  ];
  tipoCarga: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.tipoCarga = params['tipo'];
    });
  }
}
*/