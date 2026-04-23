import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
} from '@angular/forms';
import { ContentService } from '../../services/content.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ContentDTO, ContentPartDTO } from '../../models/content.model';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-content-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './content-admin.component.html',
  styleUrls: ['./content-admin.component.css'],
})
export class ContentAdminComponent implements OnInit {
  list: ContentDTO[] = [];
  loadingList = false;
  selected: ContentDTO | null = null;
  form: FormGroup;
  previewSafeHtml: SafeHtml | null = null;
  saving = false;
  message = '';

  constructor(
    private contentService: ContentService,
    private fb: FormBuilder,
    private dom: DomSanitizer
  ) {
    this.form = this.fb.group({
      id: [null],
      keyName: [''],
      title: [''],
      language: ['es'],
      active: [true],
      parts: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.loadList();
  }

  get partsArray(): FormArray {
    return this.form.get('parts') as FormArray;
  }

  loadList() {
    this.loadingList = true;
    this.contentService
      .listAll()
      .pipe(
        catchError((_) => {
          this.loadingList = false;
          return of([]);
        })
      )
      .subscribe((res: any[]) => {
        this.list = res || [];
        this.loadingList = false;
      });
  }

  select(item?: ContentDTO) {
    if (!item) {
      this.selected = null;
      this.form.reset({
        id: null,
        keyName: '',
        title: '',
        language: 'es',
        active: true,
      });
      this.partsArray.clear();
      this.previewSafeHtml = null;
      return;
    }
    this.selected = item;
    this.form.patchValue({
      id: item.id,
      keyName: item.keyName,
      title: item.title,
      language: item.language,
      active: item.active,
    });
    (item.parts || []).forEach((p) => {
      const group = this.fb.group({
        id: [p.id],
        partKey: [{ value: p.partKey, disabled: true }],
        title: [p.title],
        htmlContent: [p.htmlContent],
        orderIndex: [p.orderIndex || 0],
      });

      // Deshabilitar campos no editables
      if (p.partKey === 'suggested_programs') {
        group.get('htmlContent')?.disable();
      }
      this.partsArray.push(group);
    });
    this.updatePreview();
  }

  updatePreview() {
    // show combined preview
    const html = (this.partsArray.getRawValue() as ContentPartDTO[])
      .map((p) => p.htmlContent)
      .join('\n');
    this.previewSafeHtml = this.dom.bypassSecurityTrustHtml(html);
  }
save() {
  if (!this.selected) {
    this.message = 'Selecciona un contenido primero.';
    return;
  }
  this.saving = true;
  this.message = '';
  const key = this.form.get('keyName')!.value;
  const parts = this.partsArray.getRawValue() as ContentPartDTO[];

  this.contentService
    .upsertParts(key, parts)
    .pipe(
      catchError((err) => {
        this.saving = false;
        this.message = 'Error al guardar.';
        console.error('Error upsertParts:', err);
        return of(null);
      })
    )
    .subscribe((saved) => {
      if (saved === null) return; // hubo error, no continuar

      this.saving = false;
      this.message = 'Guardado correctamente.';

      // Refrescar lista y formulario con manejo de error
      this.loadList();
      this.contentService
        .getByKey(key)
        .pipe(  
          catchError((err) => {
            console.error('Error al refrescar contenido:', err);
            return of(null);
          })
        )
        .subscribe((dto) => {
          if (dto) this.select(dto);
        });
    });
}
save() {
  if (!this.selected) {
    this.message = 'Selecciona un contenido primero.';
    return;
  }
  this.saving = true;
  this.message = '';
  const key = this.form.get('keyName')!.value;
  const parts = this.partsArray.getRawValue() as ContentPartDTO[];

  this.contentService
    .upsertParts(key, parts)
    .pipe(
      catchError((err) => {
        this.saving = false;
        this.message = 'Error al guardar.';
        console.error('Error upsertParts:', err);
        return of(null);
      })
    )
    .subscribe((saved) => {
      if (saved === null) return; // hubo error, no continuar

      this.saving = false;
      this.message = 'Guardado correctamente.';

      // Refrescar lista y formulario con manejo de error
      this.loadList();
      this.contentService
        .getByKey(key)
        .pipe(  
          catchError((err) => {
            console.error('Error al refrescar contenido:', err);
            return of(null);
          })
        )
        .subscribe((dto) => {
          if (dto) this.select(dto);
        });
    });
}
}


