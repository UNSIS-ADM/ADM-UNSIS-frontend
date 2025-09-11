import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AlertComponent } from './alert/alert.component';
import { FooterComponent } from "./footer/footer.component";
import { NavComponent } from "./nav/nav.component";
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { SessionModalComponent } from "./session-modal/session-modal.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatDividerModule,
    MatButtonModule,
    AlertComponent,
    FooterComponent,
    NavComponent,
    SessionModalComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'ADM-UNSIS-frontend';
  isLoginPage = false;
  isDesktop = true;
  showModal = false;
  /** tiempo antes de expirar para mostrar modal (ms) */
  warningTime = 5000; // 5s antes de expirar

  private tokenInterval: any;

constructor(private router: Router, private auth: AuthService) {
  // Detecta cambios de ruta
  this.router.events.subscribe((event: Event) => {
    if (event instanceof NavigationEnd) {
      this.isLoginPage = this.isLoginRoute();

      // 🔹 Si no estamos en login y hay token, inicia contador
      if (!this.isLoginPage && this.auth.getToken()) {
        this.startTokenWatcher();
      }
    }
  });
}

ngOnInit() {
  this.checkScreenSize();

  // 🔹 Suscribirse a token$ para iniciar contador al hacer login
  this.auth.token$.subscribe(token => {
    if (token && !this.isLoginRoute()) {
      this.startTokenWatcher();
    }
  });

  // 🔹 Detectar cambio de ruta
  this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) {
      if (!this.isLoginRoute() && this.auth.getToken()) {
        this.startTokenWatcher();
      }
    }
  });
}

  ngOnDestroy() {
    // Limpia el interval al destruir el componente
    if (this.tokenInterval) {
      clearInterval(this.tokenInterval);
    }
  }

  ngAfterViewInit() {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isDesktop = window.innerWidth >= 1024;
  }

  isLoginRoute(): boolean {
    const url = this.router.url;
    return url.startsWith('/login') || url === '/' || url === '/not-found';
  }

startTokenWatcher() {
  if (this.isLoginRoute()){
    
    console.log("estas en login",this.isLoginRoute());
  }else{
    
    const exp = this.auth.getTokenExpiration();
  if (exp === null) {
    console.error('No se pudo obtener la expiración del token');
    return;
  }

  // exp en segundos; Date.now() en ms → dividimos
  let tiempoRestante = exp - Math.floor(Date.now() / 1000);

  if (this.tokenInterval) clearInterval(this.tokenInterval);

  this.tokenInterval = setInterval(() => {
    tiempoRestante--;

    console.log('Tiempo restante:', tiempoRestante + 's');

    if (tiempoRestante === 15 && !this.showModal) {
      this.showModal = true;
      console.log('Mostrando modal de extensión de sesión');
    }

    if (tiempoRestante <= 0) {
      clearInterval(this.tokenInterval);
      console.log('Tiempo agotado, cerrando sesión');
      this.auth.logout();
      this.showModal=false;
      this.router.navigate(['/login']);
    }
  }, 1000);  }
}

renovarSesion() {
  this.auth.refreshToken().subscribe({
    next: () => {
      console.log('Token renovado automáticamente');
      this.showModal = false;
      this.startTokenWatcher(); // vuelve a arrancar el contador con el nuevo token
    },
    error: (err) => {
      console.error('Error al refrescar token', err);
      this.auth.logout();
      this.router.navigate(['/login']);
    },
  });
}

handleExtend() {
  console.log('Usuario quiere extender sesión manualmente');
  this.renovarSesion();
}

  handleCancel() {
    console.log('Usuario cierra sesión');
    this.auth.logout();
    window.location.href = '/login';
  }
}
