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
        // Guarda el token si lo necesitas
        if (response.token) {
          this.authService.saveToken(response.token);
        }
        // Guarda los roles y el usuario en localStorage para el guard
        const userInfo = {
          username: response.username,
          roles: response.roles,
          full_name: response.fullName,  // ← Aquí usamos fullName (del backend)
 // <-- aquí se guardan los roles
        };
        localStorage.setItem('user_info', JSON.stringify(userInfo));
        console.log('Información del usuario guardada:', JSON.stringify(userInfo));
        this.success = '¡Sesión iniciada con éxito! '; // ← Mensaje de éxito
        this.error = '';
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1000); // Espera 2 segundos antes de redirigir
      },
      error: (error) => {
        console.error('Error detallado:', error);
        this.error = 'Usuario o contraseña incorrectos';
        this.success = '';  
        
      }
    });
  }
}
