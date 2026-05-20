  import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { FormsModule } from '@angular/forms';
  import { TiempoRelativoPipe } from '../../tiempo-relativo.pipe';
  import { ExcelServiceApplicants, ExcelUploadResponse } from '../services/excel.service';
  import { AlumnosService } from '../services/alumnos.service';
  import { FiltradoService } from '../services/filtrado.service';
  import { AlertService } from '../services/alert.service';
  import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ModalEditApplicantComponent } from '../applicants/modal-edit-applicant/modal-edit-applicant.component';
import { Router } from '@angular/router';



  @Component({
    selector: 'app-carga-datos',
    standalone: true,
    imports: [
      CommonModule,
      FormsModule,
      TiempoRelativoPipe,
      ConfirmDialogComponent,
      ModalEditApplicantComponent
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
    showModal: boolean = false;
    selectedApplicant: any = null; // aquí guardamos el aspirante que se va a editar


    // 👇 Nuevas propiedades para años
    aniosDisponibles: number[] = [];
    originalApplicant: any;
 // 🔹 Filtros
  anioSeleccionado: string = '';
  carreraSeleccionada: string = '';
  statusSeleccionado: string = '';
  
  carrerasDisponibles: string[] = [];
currentRoute: string = '';

    constructor(
      private excelService: ExcelServiceApplicants,
      private alumnosService: AlumnosService,
      private filtradoService: FiltradoService,
      private cdRef: ChangeDetectorRef,
      private alertService: AlertService,
      private router: Router
    ) {}

    ngOnInit() {
      this.generarAnios();
      this.loadAlumnos();
      this.currentRoute = this.router.url;
    }

    

    loadAlumnos() {
      this.isLoading = true;
      this.alumnosService.getAlumnos(0, 1000).subscribe({
  next: (resultados) => {
    this.datos = resultados;
    this.filteredData = [...this.datos];
    console.log(this.filteredData);
    // 🔹 Llenar select de años
    const yearsFromEndpoint = this.datos.map((a) => a.admissionYear);
    const currentYear = new Date().getFullYear();
    const lastFiveYears = Array.from({ length: 5 }, (_, i) => currentYear - i);
    this.aniosDisponibles = [
      ...new Set([...yearsFromEndpoint, ...lastFiveYears]),
    ].sort((a, b) => b - a);
    this.anioSeleccionado = currentYear.toString();

    // 🔹 Llenar select de carreras
    this.carrerasDisponibles = [
      ...new Set(this.datos.map((a) => a.career).filter(Boolean)),
    ].sort();

    this.aplicarFiltros();

    this.isLoading = false;
    this.cdRef.detectChanges();
  },
  error: () => {
    this.alertService.showAlert('Error al cargar los datos', 'danger');
    this.isLoading = false;
    this.cdRef.detectChanges();
  },
});
    }


 // --- Filtros ---
  generarAnios() {
    const currentYear = new Date().getFullYear();
    this.aniosDisponibles = [];
    for (let i = 0; i < 5; i++) {
      this.aniosDisponibles.push(currentYear - i);
    }
  }

   aplicarFiltros() {
    const busqueda = this.terminoBusqueda.toLowerCase().trim();

    this.filteredData = this.datos.filter((a) => {
      // Filtros de Select
      const coincideAnio = !this.anioSeleccionado || a.admissionYear == this.anioSeleccionado;
      const coincideCarrera = !this.carreraSeleccionada || a.career == this.carreraSeleccionada;
      const coincideStatus = !this.statusSeleccionado || a.status == this.statusSeleccionado;

      // Filtro de Buscador (Nombre, CURP o Ficha)
      const coincideBusqueda = !busqueda || 
        (a.fullName && a.fullName.toLowerCase().includes(busqueda)) ||
        (a.curp && a.curp.toLowerCase().includes(busqueda)) ||
        (a.ficha && a.ficha.toString().includes(busqueda));

      return coincideAnio && coincideCarrera && coincideStatus && coincideBusqueda;
    });

    this.currentPage = 1; // Reinicia paginación al filtrar
    this.cdRef.detectChanges();
  }

  // Método para el evento input del buscador
  onSearch() {
    this.aplicarFiltros();
  }

  limpiarBusqueda() {
    this.terminoBusqueda = '';
    this.aplicarFiltros();
  }

  filtrarPorAnio() {
    this.aplicarFiltros();
  }

  filtrarPorCarrera() {
    this.aplicarFiltros();
  }

  filtrarPorStatus() {
    this.aplicarFiltros();
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
      if (!this.selectedFile) return;

      this.isLoading = true;
      this.cdRef.detectChanges();

      this.excelService.uploadApplicants(this.selectedFile, this.token).subscribe({
        next: (res) => {
          this.uploadResult = res;

          if (res.success) {
            this.alertService.showAlert('Datos cargados exitosamente', 'success');
            this.loadAlumnos();
          } else {
            this.alertService.showAlert(res.message || 'Error al procesar el archivo', 'danger');
            this.isLoading = false;
            this.cdRef.detectChanges();
          }
        },
        error: (err) => {
          console.error(err);
          this.uploadResult = {
            success: false,
            message: 'No se pudo subir el archivo. Intenta de nuevo.',
            errors: [],
          };
          this.alertService.showAlert(this.uploadResult.message, 'danger');
          this.isLoading = false;
          this.cdRef.detectChanges();
        }
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

  //editar alumnos modal 
  openModal(id: number) {
    this.alumnosService.getApplicantById(id).subscribe({
      next: (data) => {
          this.selectedApplicant = { ...data }; // datos actuales para editar
        this.originalApplicant = { ...data };  // 👈 guardamos SOLO ese alumno
        this.showModal = true;
      },
      error: (err) => {
        console.error('Error:', err);
      }
    });
  }

    closeModal() {
      this.showModal = false;
    }
  // componente.ts
  saveApplicant() {
    if (!this.selectedApplicant?.id) {
      console.error('No hay aspirante seleccionado');
      return;
    }

    // compara campo por campo con el original:
    const updatedData: any = {};

    Object.keys(this.selectedApplicant).forEach(key => {
      if (this.selectedApplicant[key] !== this.originalApplicant[key]) {
        updatedData[key] = this.selectedApplicant[key];
      }
    });

    // si no hay cambios, no hace falta llamar al servicio
    if (Object.keys(updatedData).length === 0) {
     
      this.closeModal();
      return;
    }

    // agrega id si tu API lo necesita
    updatedData.id = this.selectedApplicant.id;

    this.alumnosService.editApplicantById(this.selectedApplicant.id, updatedData)
      .subscribe({
        next: (res) => {
          
          this.loadAlumnos();
          this.closeModal();
        },
        error: (err) => console.error('Error al editar aspirante', err)
      });
  }


  }
