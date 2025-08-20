import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

import { CommonModule } from '@angular/common';
import { SecretariaService } from '../services/secretaria.service';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-registrar-usuario',
  standalone: true,
  imports: [
    FormsModule,
    NgClass,
    CommonModule,
    HttpClientModule
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

onSubmit() {
  this.formSubmitted = true;

  // Validaciones
  if (!this.usuario.username || !this.usuario.fullName || 
      !this.usuario.password || !this.usuario.confirmPassword) {
    this.alertService.showAlert('Todos los campos son obligatorios', 'warning');
    return;
  }

  if (this.usuario.password !== this.usuario.confirmPassword) {
    this.alertService.showAlert('Las contraseñas no coinciden', 'danger');
    return;
  }

  // Abrir confirmación antes de registrar
  this.abrirConfirmacion(
    `¿Estás seguro de registrar al usuario?`,
    () => {
      // Callback cuando el usuario confirma
      this.showConfirmModal = false;

      this.secretariaService.registrarSecretaria(this.usuario).subscribe({
        next: (response) => {
          this.alertService.showAlert('Secretaria registrada exitosamente', 'success');
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 2000);
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

}
