import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ResultadosMostrarService } from '../services/resultados-mostrar.service';
import { ContentService } from '../services/content.service';
import { ContentDTO } from '../models/content.model';

@Component({
  selector: 'app-resultado',
  standalone: true,
  imports: [MatCardModule, CommonModule, RouterLink],
  templateUrl: './resultado.component.html',
  styleUrls: ['./resultado.component.css'],
})
export class ResultadoComponent implements OnInit {
  emailContacto = 'admision.unsis@gmail.com';

  // Datos del alumno
  alumno: any = null;

  // Resultado específico para medicina
  resultado = { promedio: null };

  todasCarreras: string[] = [
    'Licenciatura en Administración Municipal',
    'Licenciatura en Ciencias Empresariales',
    'Licenciatura en Administración Pública',
    'Licenciatura en Informática',
    'Licenciatura en Enfermería',
    'Licenciatura en Odontología',
    'Licenciatura en Nutrición',
    'Licenciatura en Ciencias Biomédicas (En proceso de registro)',
  ];
  carrerasDisponibles: string[] = [];

  // Flags para controlar la vista
  vacio = false;
  esMedicina = false;
  esAceptado = false;
  esReprobado = false;
  esMedicinaReprobado = false;
  esOtraCarreraReprobado = false;

  // HTML recibidos del backend (raw + safe)
  acceptedContent: ContentDTO | null = null;
  acceptedPartsSafe: SafeHtml[] = [];

  rejectedContent: ContentDTO | null = null;
  rejectedPartsSafe: SafeHtml[] = [];

  constructor(
    private resultadosService: ResultadosMostrarService,
    private contentService: ContentService,
    private dom: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.resultadosService.getResultadosUsuario().subscribe({
      next: (data) => {
        this.alumno = data;
        this.actualizarFlags();
        // Cargar contenidos del CMS (mensajes) siempre que haya alumno
        if (this.alumno) {
          this.loadContentMessages();
        }
        console.log('Datos del alumno:', this.alumno);
      },
      error: (err) => {
        console.error('Error al cargar resultados:', err);
        this.vacio = true;
      },
    });
  }

  // Método para actualizar las banderas cuando cambian los datos
  actualizarFlags() {
    if (!this.alumno) return;

    const carrera = (this.alumno.career || '').toLowerCase().trim();
    const resultado = (this.alumno.status || '').toLowerCase().trim();

    this.esMedicina = carrera === 'licenciatura en medicina';
    this.esAceptado = resultado === 'aceptado';
    this.esReprobado = resultado === 'rechazado';
    this.esMedicinaReprobado = this.esMedicina && this.esReprobado;
    this.esOtraCarreraReprobado = !this.esMedicina && this.esReprobado;

    if (this.esMedicina) {
      this.resultado.promedio = this.alumno.score;
    }

    // Filtrar las carreras disponibles quitando la del alumno
    this.carrerasDisponibles = this.todasCarreras.filter(
      (c) => c.toLowerCase().trim() !== carrera
    );
  }

  private renderPartHtml(rawHtml: string): string {
    if (!rawHtml) return '';
    let html = rawHtml;

    // Reemplazar la carrera del alumno usando la propiedad correcta
    if (html.includes('%CARRERA_ALUMNO%')) {
      const carreraNombre = this.alumno?.careerAtResult || 'la licenciatura seleccionada';
      html = html.replace(/%CARRERA_ALUMNO%/g, `<strong>${this.escapeHtml(carreraNombre)}</strong>`);
    }

    // Reemplazar tokens de contacto
    html = html.replace(/%EMAIL_CONTACT%/g, this.emailContacto || 'admision.unsis@gmail.com');
    html = html.replace(/%PHONE%/g, '9515724100 Ext. 1203, 1204');

    // Reemplazar lista dinámica de carreras
    if (html.includes('%CARRERAS_LIST%')) {
      const items = (this.carrerasDisponibles || [])
        .map((c) => `<li>${this.escapeHtml(c)}</li>`)
        .join('\n');
      const ul = `<ul class="list-disc list-inside ml-4">${items}</ul>`;
      html = html.replace(/%CARRERAS_LIST%/g, ul);
    }

    return html;
  }

  // escapado básico para evitar inyección en los nombres de carreras
  private escapeHtml(text: string): string {
    return (text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private loadContentMessages() {
    // mensaje aceptado
    if (this.esAceptado) {
      this.contentService.getByKey('Mensaje_aceptado').subscribe({
        next: (dto) => {
          this.acceptedContent = dto;
          this.acceptedPartsSafe = (dto.parts || []).map((p) => {
            const html = this.renderPartHtml(p.htmlContent || '');
            return this.dom.bypassSecurityTrustHtml(html);
          });
        },
        error: (err) => console.warn('No se pudo cargar mensaje aceptado', err),
      });
    }

    // mensaje reprobado
    if (this.esReprobado) {
      this.contentService.getByKey('Mensaje_reprobado').subscribe({
        next: (dto) => {
          this.rejectedContent = dto;
          this.rejectedPartsSafe = (dto.parts || []).map((p) => {
            const html = this.renderPartHtml(p.htmlContent || '');
            return this.dom.bypassSecurityTrustHtml(html);
          });
        },
        error: (err) => console.warn('No se pudo cargar mensaje reprobado', err),
      });
    }
  }
}