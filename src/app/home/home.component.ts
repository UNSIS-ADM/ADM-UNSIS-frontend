import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service'; // Importa el AuthService

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  nombreUsuario: string = 'Invitado'; // Valor por defecto

  constructor(private authService: AuthService) {} // Inyecta AuthService

  ngOnInit(): void {
    // Obtiene la información del usuario al inicializar el componente
    const userInfo = this.authService.getUserInfo();
    if (userInfo && userInfo.full_name) {
      this.nombreUsuario = userInfo.full_name;
    }
  }
}