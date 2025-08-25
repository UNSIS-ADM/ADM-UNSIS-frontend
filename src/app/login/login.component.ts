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
import { AlertService } from '../services/alert.service';

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
    private router: Router,
    private alertService: AlertService
  ) { }

onSubmit(): void {
  console.log('Intentando login con:', this.credentials);

  this.authService.login(this.credentials).subscribe({
    next: (response) => {
      

      // Guardar token si existe
      if (response.token) {
        this.authService.saveToken(response.token);
      }

      // Guardar info de usuario en localStorage
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
            this.alertService.showAlert('¡Login exitoso!', 'success');
            this.error = '';
            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 1000);
          },
          error: (err) => {
            if (err.status === 403){
              this.alertService.showAlert('Acceso denegado.', 'danger');
               setTimeout(() => {
                 this.router.navigate(['/not-found']);
               }, 2000);
            }
            
          }
        });
      } else {
      
       this.alertService.showAlert('¡Login exitoso!', 'success');
      this.error = '';
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 1000);
    }
  }
})}}


