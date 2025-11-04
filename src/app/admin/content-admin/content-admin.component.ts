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
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-content-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, QuillModule],
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

  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['clean']
    ],
    theme: 'snow',
    formats: [
      'bold', 'italic', 'underline', 'strike',
      'blockquote', 'code-block', 'header',
      'list', 'bullet', 'align'
    ]
  };

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
    this.partsArray.clear();
    (item.parts || []).forEach((p) => {
      this.partsArray.push(
        this.fb.group({
          id: [p.id],
          partKey: [{ value: p.partKey, disabled: true }], // disabled: inmutable
          title: [p.title],
          htmlContent: [p.htmlContent],
          orderIndex: [p.orderIndex || 0],
        })
      );
    });
    this.updatePreview();
  }

  updatePreview() {
    // show combined preview
    const html = (this.partsArray.getRawValue() as ContentPartDTO[])
      .map((p) => {
        // Si el contenido HTML está vacío, devolver una cadena vacía
        if (!p.htmlContent) return '';
        // Si el contenido ya es HTML (desde Quill), usarlo directamente
        return p.htmlContent;
      })
      .join('\n');
    this.previewSafeHtml = this.dom.bypassSecurityTrustHtml(html);
  }

  save() {
    if (!this.selected) {
      this.message = 'Selecciona un contenido primero.';
      return;
    }
    this.saving = true;
    const key = this.form.get('keyName')!.value;
    // getRawValue to include disabled partKey
    const parts = this.partsArray.getRawValue() as ContentPartDTO[];
    
    // Debug: Verificar el contenido HTML antes de enviar
    console.log('Contenido HTML a enviar:', parts.map(p => p.htmlContent));
    
    this.contentService
      .upsertParts(key, parts)
      .pipe(
        catchError((err) => {
          this.saving = false;
          this.message = 'Error al guardar';
          return of(null);
        })
      )
      .subscribe((saved) => {
        this.saving = false;
        this.message = 'Guardado correctamente.';
        this.loadList();
        // refresh selected content
        this.contentService.getByKey(key).subscribe((dto) => this.select(dto));
      });
  }
}
