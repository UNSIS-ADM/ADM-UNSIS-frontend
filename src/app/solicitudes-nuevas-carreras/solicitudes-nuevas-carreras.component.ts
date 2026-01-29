import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitudService } from '../services/solicitud.service';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-solicitudes-nuevas-carreras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitudes-nuevas-carreras.component.html',
  styleUrls: ['./solicitudes-nuevas-carreras.component.css']
})
export class SolicitudesNuevasCarrerasComponent implements OnInit {

  solicitudes: any[] = [];           // datos crudos
  filteredData: any[] = [];          // datos filtrados
  currentPage = 1;
  itemsPerPage = 5;
  Math = Math;
  LONGITUD_RENGLON = 20;
  MAX_RENGLONES = 2;


  // Modal
  modalVisible = false;
  comentarioSecretaria = '';
  solicitudSeleccionadaId: number | null = null;

  constructor(
    private solicitudService: SolicitudService,
    private alertService: AlertService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.obtenerSolicitudes();
  }

  obtenerSolicitudes(): void {
    this.solicitudService.obtenerSolicitudes().subscribe({
      next: data => {
        this.solicitudes = data.map(item => ({
          id: item.id,
          ficha: item.ficha,
          nuevaCarrera: item.newCareer,
          antiguacarrera: item.oldCareer,
          comentario: item.requestComment,
          estado: item.estado || 'Pendiente'
        }));
        // Inicializamos filteredData
        this.filteredData = [...this.solicitudes];
        this.cdRef.detectChanges();
      },
      error: err => {
        console.error('Error al obtener solicitudes:', err);
        this.alertService.showAlert('Error al obtener solicitudes', 'danger');
      }
    });
  }

  // Modal
  abrirModal(solicitudId: number): void {
    this.solicitudSeleccionadaId = solicitudId;
    this.comentarioSecretaria = '';
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.solicitudSeleccionadaId = null;
    this.comentarioSecretaria = '';
  }

  enviarRespuesta(action: 'ACEPTADO' | 'RECHAZADO'): void {
    if (!this.solicitudSeleccionadaId) return;

    this.solicitudService.responderSolicitud(this.solicitudSeleccionadaId, {
      action,
      responseComment: this.comentarioSecretaria
    }).subscribe({
      next: () => {
        this.cerrarModal();
        this.obtenerSolicitudes();
        this.alertService.showAlert('Respuesta enviada correctamente', 'success');
      },
      error: err => {
        console.error(err);
        this.alertService.showAlert('Error al enviar la respuesta', 'danger');
      }
    });
  }

  /** 🔹 PAGINACIÓN igual a CargaDatosComponent */
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
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (last !== undefined && typeof i === 'number') {
        if ((i as number) - last === 2) {
          rangeWithDots.push(last + 1);
        } else if ((i as number) - last > 2) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      last = i as number;
    }

    return rangeWithDots;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get emptyRows(): any[] {
    const rowsOnPage = this.paginatedData.length;
    if (rowsOnPage > 0 && rowsOnPage < this.itemsPerPage) {
      return Array(this.itemsPerPage - rowsOnPage);
    }
    return [];
  }
  formatearComentario(texto: string): string {
  if (!texto) return '';

  let resultado = '';
  for (let i = 0; i < texto.length; i += this.LONGITUD_RENGLON) {
    resultado += texto.substring(i, i + this.LONGITUD_RENGLON) + '\n';
  }
  return resultado.trim();
}

obtenerTextoVisible(solicitud: any): string {
  const textoFormateado = this.formatearComentario(solicitud.comentario);

  if (solicitud.verMas) {
    return textoFormateado;
  }

  return textoFormateado
    .split('\n')
    .slice(0, this.MAX_RENGLONES)
    .join('\n');
}

tieneMasDeDosRenglones(texto: string): boolean {
  if (!texto) return false;
  return Math.ceil(texto.length / this.LONGITUD_RENGLON) > this.MAX_RENGLONES;
}

toggleVerMas(solicitud: any): void {
  solicitud.verMas = !solicitud.verMas;
}

}
