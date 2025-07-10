import { Routes } from '@angular/router';
import { UsuarioComponent } from './usuario/usuario.component';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {   
    path: 'home',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
    canActivate: [RoleGuard],
    data: { roles: ['Admin', 'Secretaria', 'Aspirante'] }
  },
  {
    path: 'resultado',
    loadComponent: () => import('./resultado/resultado.component').then(m => m.ResultadoComponent),
    canActivate: [RoleGuard],
    data: { roles: ['Admin', 'Aspirante'] }
  },
  { 
    path: 'usuario', 
    component: UsuarioComponent,
    canActivate: [RoleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'cargar',
    loadComponent: () => import('./carga-datos/carga-datos.component')
      .then(m => m.CargaDatosComponent),
    canActivate: [RoleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'alumnos',
    loadComponent: () => import('./alumnos/alumnos.component').then(m => m.AlumnosComponent),
    canActivate: [RoleGuard],
    data: { roles: ['Admin', 'Secretaria'] }
  }
];
