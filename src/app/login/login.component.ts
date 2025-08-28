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
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  credentials = {
    username: '',
    password: '',
  };
  error = '';
  success = '';

//  error: string | null = null;
//  success: string | null = null;
  showPassword = false;

  // -------------------------------------------------------------

  // Carrusel
  slides = [
    { src: 'assets/images/Historia.png', alt: 'Slide 1' },
    { src: 'assets/images/Modelo.png', alt: 'Slide 2' },
    { src: 'assets/images/Biblioteca.png', alt: 'Slide 3' },
  ];
  currentSlide = 0;
  private intervalId: any = null;
  carouselInterval = 4000; // ms por slide

  ngOnInit(): void {
    this.startCarousel();
  }

  ngOnDestroy(): void {
    this.clearCarouselInterval();
  }

  startCarousel() {
    this.clearCarouselInterval();
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, this.carouselInterval);
  }

  clearCarouselInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  pauseCarousel() {
    this.clearCarouselInterval();
  }

  resumeCarousel() {
    // reinicia solo si no existe ya
    if (!this.intervalId) {
      this.startCarousel();
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  goToSlide(idx: number) {
    this.currentSlide = idx % this.slides.length;
    // reinicia el timer para que el usuario tenga tiempo de ver la que eligió
    this.startCarousel();
  }

  // show/hide password y onSubmit (mantener tu lógica)
  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService
  ) {}

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
            this.alertService.showAlert('¡Login exitoso!', 'success');
            this.error = '';
            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 1000);
          },
          error: (err) => {
            if (err.status === 403) {
              this.alertService.showAlert('Acceso denegado.', 'danger');
              setTimeout(() => {
                this.router.navigate(['/not-found']);
              }, 2000);
            } else {
              this.alertService.showAlert('Error validando applicant.', 'danger');
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
    },
    error: (err) => {
      console.error('Error en login:', err);
      if (err.status === 401) {
        this.alertService.showAlert('Error en el servidor. Intenta más tarde.', 'danger');
     
      } else {
           this.alertService.showAlert('Usuario o contraseña incorrectos.', 'danger');
      }
    }
  });
}

}


