import { Component, HostListener, OnInit } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AlertComponent } from './alert/alert.component';
import { FooterComponent } from "./footer/footer.component";
import { NavComponent } from "./nav/nav.component";
import { CommonModule } from '@angular/common';

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
    NavComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'ADM-UNSIS-frontend';
  isLoginPage: boolean = false;
  isDesktop: boolean = true; // Variable para detectar escritorio

  constructor(private router: Router) {
    // Detecta cambios de ruta
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.isLoginPage = event.url === '/login';
      }
    });
  }

ngOnInit() {
  this.checkScreenSize(); // Detecta al iniciar
}

ngAfterViewInit() {
  this.checkScreenSize(); // Refuerza detección ya con la vista lista
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

}
