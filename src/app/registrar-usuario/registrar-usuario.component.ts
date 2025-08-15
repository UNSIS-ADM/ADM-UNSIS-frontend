import { Component } from '@angular/core';
import { NavComponent } from "../nav/nav.component";
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { FooterComponent } from "../footer/footer.component";
import { CommonModule } from '@angular/common';
import { SecretariaService } from '../services/secretaria.service';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-registrar-usuario',
  standalone: true,
  imports: [
    NavComponent, 
    FormsModule, 
    NgClass, 
    FooterComponent, 
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

  formSubmitted: boolean = false;

  constructor(
    private secretariaService: SecretariaService,
    private router: Router,
    private alertService: AlertService
  ) {}

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
}
