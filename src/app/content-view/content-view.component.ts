import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ContentService } from '../services/content.service';
import { ContentDTO } from '../models/content.model';
 import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-content-view',
  imports: [CommonModule],
  templateUrl: './content-view.component.html',
  styleUrl: './content-view.component.css',
})
export class ContentViewComponent implements OnInit {
  @Input() keyName!: string;
  /** placeholders: { emailContacto: '...', carrerasDisponibles: '<ul>...</ul>' } */
  @Input() placeholders?: Record<string, string>;

  safeHtml: SafeHtml | null = null;
  loading = false;
  error: string | null = null;

  constructor(private svc: ContentService, private dom: DomSanitizer) {}

  ngOnInit(): void {
    if (!this.keyName) {
      this.error = 'No se indicó keyName';
      return;
    }
    this.load();
  }

  load() {
    this.loading = true;
    this.svc
      .getByKey(this.keyName)
      .pipe(
        catchError((err) => {
          this.loading = false;
          this.error = 'No se pudo cargar el contenido';
          return of(null);
        })
      )
      .subscribe((dto: ContentDTO | null) => {
        this.loading = false;
        if (!dto || !dto.htmlContent) {
          this.error = 'Contenido no encontrado';
          return;
        }
        let html = dto.htmlContent;

        // Reemplazar placeholders simples: {{emailContacto}} etc.
        if (this.placeholders) {
          for (const [k, v] of Object.entries(this.placeholders)) {
            const pattern = new RegExp(
              '\\{\\{\\s*' + this.escapeForRegExp(k) + '\\s*\\}\\}',
              'g'
            );
            // Si la placeholder trae HTML preformateado (p.ej. lista), inyectamos tal cual.
            html = html.replace(pattern, v ?? '');
          }
        }

        // Confiamos en sanitización en backend (Jsoup). Hacemos bypass único.
        this.safeHtml = this.dom.bypassSecurityTrustHtml(html);
      });
  }

  // Helper para escapar nombres en RegExp
  private escapeForRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}