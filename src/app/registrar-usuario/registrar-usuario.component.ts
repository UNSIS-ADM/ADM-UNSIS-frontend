import { Component } from '@angular/core';
import { NavComponent } from "../nav/nav.component";
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { FooterComponent } from "../footer/footer.component";
import { CommonModule } from '@angular/common';
import { SecretariaService } from '../services/secretaria.service';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

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

  errorMessage: string = '';
  successMessage: string = '';
  formSubmitted: boolean = false; // Nuevo: para controlar si se ha intentado enviar el formulario

  constructor(
    private secretariaService: SecretariaService,
    private router: Router
  ) {}

  onSubmit() {
    this.formSubmitted = true; // Marcar que se intentó enviar el formulario
    
    // Validar campos vacíos
    if (!this.usuario.username || !this.usuario.fullName || 
        !this.usuario.password || !this.usuario.confirmPassword) {
      this.errorMessage = 'Todos los campos son obligatorios';
      return;
    }

    if (this.usuario.password !== this.usuario.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.secretariaService.registrarSecretaria(this.usuario).subscribe({
      next: (response) => {
        this.successMessage = 'Secretaria registrada exitosamente';
        this.errorMessage = '';
         setTimeout(() => {
          this.router.navigate(['/home']);
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al registrar la secretaria';
        this.successMessage = '';
      }
    });
  }
}