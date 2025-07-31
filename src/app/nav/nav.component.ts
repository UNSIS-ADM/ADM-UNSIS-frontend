import { Component, HostListener, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-nav',
  imports: [RouterModule, CommonModule, MatToolbarModule, MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule, MatMenuModule, MatSidenavModule, MatDividerModule, MatButtonModule],
  standalone: true,
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  isMobile: boolean | undefined;
  isUserMenuOpen = false;
  isSidebarOpen = false;
  isSubmenuOpen = false;
  isCargaMenuOpen = false;
  roles: string[] = [];
  username: string = ''; // Nueva propiedad para el nombre del usuario

  constructor() {
    const user = JSON.parse(localStorage.getItem('user_info') || '{}');
    this.roles = user.roles || [];
   this.username = user?.full_name || 'Invitado';
   console.log('nombre del usuario:', this.username);
  }

  @HostListener('window:resize', [])
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  ngOnInit(): void {
    initFlowbite();
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleSubmenu(): void {
    this.isSubmenuOpen = !this.isSubmenuOpen;
  }

  toggleCargaMenu(): void {
    this.isCargaMenuOpen = !this.isCargaMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const userMenuButton = document.getElementById('dropdownUserButton');
    const userMenu = document.getElementById('dropdown-user');
    
    if (!userMenuButton?.contains(event.target as Node) && 
        !userMenu?.contains(event.target as Node)) {
      this.isUserMenuOpen = false;
    }
  }

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }
}