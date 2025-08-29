import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { CommonModule } from '@angular/common';
import { SecretariaService } from '../services/secretaria.service';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AlertService } from '../services/alert.service';
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";

@Component({
  selector: 'app-registrar-usuario',
  standalone: true,
  imports: [
    FormsModule,
    NgClass,
    CommonModule,
    HttpClientModule,
    ConfirmDialogComponent
],
  templateUrl: './registrar-usuario.component.html',
  styleUrls: ['./registrar-usuario.component.css']
})
export class RegistrarUsuarioComponent {
  usuario = {
    username: '',
    fullName: '',
    password: '',
    confirmPassword: ''
  };
  showConfirmModal = false;
  confirmMessage = '';
  confirmCallback: (() => void) | null = null;

  formSubmitted: boolean = false;

  constructor(
    private secretariaService: SecretariaService,
    private router: Router,
    private alertService: AlertService
  ) { }

  onSubmit(form: any) {
    this.formSubmitted = true;

    if (!form.valid || this.usuario.password !== this.usuario.confirmPassword) {
      return; // 🚫 Detener envío si el formulario no es válido
    }

    // Abrir confirmación antes de registrar
    this.abrirConfirmacion(
      `¿Estás seguro de registrar al usuario?`,
      () => {
        this.showConfirmModal = false;

        this.secretariaService.registrarSecretaria(this.usuario).subscribe({
          next: () => {
            this.alertService.showAlert('Secretaria registrada exitosamente', 'success');
            setTimeout(() => this.router.navigate(['/home']), 2000);
          },
          error: (err) => {
            const msg = err.error?.message || 'Error al registrar la secretaria';
            this.alertService.showAlert(msg, 'danger');
          }
        });
      }
    );
  }

  abrirConfirmacion(message: string, callback: () => void) {
    this.confirmMessage = message;
    this.confirmCallback = callback;
    this.showConfirmModal = true;
  }
  handleConfirm(confirmed: boolean) {
  this.showConfirmModal = false;

  if (confirmed && this.confirmCallback) {
    this.confirmCallback();
  }
}
}
