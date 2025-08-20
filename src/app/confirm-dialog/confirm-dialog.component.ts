import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent {
  @Input() title: string = 'Confirmación';
  @Input() message: string = '¿Estás seguro?';
  @Output() confirm = new EventEmitter<boolean>();

  onConfirm() {
    this.confirm.emit(true);
  }

  onCancel() {
    this.confirm.emit(false);
  }
}
