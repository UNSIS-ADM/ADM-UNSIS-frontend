import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = {
    username: '',
    password: ''
  };
  error = '';
  success = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit(): void {
  console.log('Intentando login con:', this.credentials);

  this.authService.login(this.credentials).subscribe({
    next: (response) => {
      console.log('Login exitoso:', response);

      if (response.token) {
        this.authService.saveToken(response.token);
      }

      const userInfo = {
        username: response.username,
        roles: response.roles,
        full_name: response.fullName,
      };
      localStorage.setItem('user_info', JSON.stringify(userInfo));
      console.log('Información del usuario guardada:', JSON.stringify(userInfo));

      // Si el rol es ROLE_APPLICANT, validamos en el endpoint
      if (response.roles.includes('ROLE_APPLICANT')) {
        this.authService.validarApplicant().subscribe({
          next: () => {
            // Si pasa la validación, continuamos como siempre
            this.success = '¡Sesión iniciada con éxito!';
            this.error = '';
            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 1000);
          },
          error: (err) => {
            if (err.status === 403){
              this.error = err.error?.error || 'Acceso temporalmente restringido para ROLE_APPLICANT';
              this.success = '';
               setTimeout(() => {
                 this.router.navigate(['/not-found']);
               }, 2000);
            }
            // Si es otro error, mostramos genérico
            this.error = 'Error en validación de acceso';
            this.success = '';
          }
        });
      } else {
        // Otros roles siguen el flujo normal
        this.success = '¡Sesión iniciada con éxito!';
        this.error = '';
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1000);
      }
    },
    error: (error) => {
      console.error('Error detallado:', error);
      this.error = 'Usuario o contraseña incorrectos';
      this.success = '';
    }
  });
}

}
