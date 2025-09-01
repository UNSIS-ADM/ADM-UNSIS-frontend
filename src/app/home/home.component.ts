import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  nombreUsuario: string = 'Invitado';
  roles: string[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const userInfo = this.authService.getUserInfo();

    if (userInfo) {
      this.nombreUsuario = userInfo.full_name || 'Invitado';
      this.roles = userInfo.roles || [];
    }

    console.log('Roles en Home:', this.roles);
  }

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }
}
