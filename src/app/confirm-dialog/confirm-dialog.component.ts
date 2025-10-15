import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  @Input() title: string = '';
  @Input() message: string = '';

  // Estos son los eventos que el componente padre escucha
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  // Cuando se hace clic en "Aceptar"
  onConfirm(): void {
    this.confirm.emit(); // 🔹 Envía el evento al padre
  }

  // Cuando se hace clic en "Cancelar"
  onCancel(): void {
    this.cancel.emit(); // 🔹 Solo cierra el modal, NO ejecuta acciones
  }
}
