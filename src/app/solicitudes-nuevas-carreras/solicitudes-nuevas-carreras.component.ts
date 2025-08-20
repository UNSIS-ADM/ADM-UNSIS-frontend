import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitudService } from '../services/solicitud.service'; // Ajusta si es diferente
import { FormsModule } from '@angular/forms';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-solicitudes-nuevas-carreras',
  standalone: true,
  imports: [ CommonModule, FormsModule],
  templateUrl: './solicitudes-nuevas-carreras.component.html',
  styleUrls: ['./solicitudes-nuevas-carreras.component.css']
})
export class SolicitudesNuevasCarrerasComponent implements OnInit {
  currentPage = 1;
  itemsPerPage = 5;
  Math = Math;

  solicitudes: {
    id: number;
    ficha: string;
    nuevaCarrera: string;
    antiguacarrera: string;
    comentario: string;
    estado: string;
  }[] = [];

  modalVisible = false;
  comentarioSecretaria = '';
  solicitudSeleccionadaId: number | null = null;

  constructor(private solicitudService: SolicitudService,
              private alertService: AlertService
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
        console.log(this.solicitudes);
      },
      error: err => {
        console.error('Error al obtener solicitudes:', err);
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
        this.obtenerSolicitudes(); // Recargar solicitudes
        this.alertService.showAlert('Respuesta enviada correctamente', 'success');
      },
      error: err => {
        this.alertService.showAlert('Error al enviar la respuesta', 'danger');
      }
    });
  }

  // Paginación
  get paginatedData() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.solicitudes.slice(start, end);
  }

  siguientePagina() {
    if ((this.currentPage * this.itemsPerPage) < this.solicitudes.length) {
      this.currentPage++;
    }
  }

  paginaAnterior() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}
