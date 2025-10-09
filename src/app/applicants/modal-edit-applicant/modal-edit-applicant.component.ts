import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-edit-applicant',
  templateUrl: './modal-edit-applicant.component.html',
  imports:[CommonModule,FormsModule],
})
export class ModalEditApplicantComponent implements OnInit {
  @Input() showModal: boolean = false;
  @Input() selectedApplicant: any = null;
  @Input() currentRoute: string = ''; // Para saber si mostrar carrera

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  carrerasDisponibles: string[] = [
    'LICENCIATURA EN INFORMÁTICA',
    'LICENCIATURA EN ENFERMERÍA',
    'LICENCIATURA EN ODONTOLOGÍA',
    'LICENCIATURA EN NUTRICIÓN',
    'LICENCIATURA EN CIENCIAS BIOMÉDICAS',
    'LICENCIATURA EN CIENCIAS EMPRESARIALES',
    'LICENCIATURA EN ADMINISTRACIÓN PÚBLICA'
  ];
  salasDisponibles: string[] = [
    'Sala de computo 1',
    'Sala de computo 2',
    'Sala de computo 3',
    'Sala de computo 4',
    'Sala de computo 5',
    'Sala de computo 6',
    'Sala de computo 7',
    'Sala de computo 8',
    'Sala de computo 9',
    'Sala de computo 10',
    'Sala de computo 11',
    'Sala de computo cedge',
    'Sala de computo patologia',
    'Biblioteca 1',
    'Biblioteca 2'
  ];

  originalApplicant: any = {};

  ngOnInit() {
    if (this.selectedApplicant) {
      // Guardamos copia para comparar cambios
      this.originalApplicant = { ...this.selectedApplicant };
    }
  }

  onSave() {
    if (!this.selectedApplicant) return;

    const updatedData: any = {};

    Object.keys(this.selectedApplicant).forEach(key => {
      if (this.selectedApplicant[key] !== this.originalApplicant[key]) {
        updatedData[key] = this.selectedApplicant[key];
      }
    });

    if (Object.keys(updatedData).length === 0) {
      console.log('No se realizaron cambios');
      this.onClose();
      return;
    }

    updatedData.id = this.selectedApplicant.id;

    // Emitimos al padre para que llame al servicio
    this.save.emit(updatedData);
  }

  onClose() {
    this.close.emit();
  }
}
