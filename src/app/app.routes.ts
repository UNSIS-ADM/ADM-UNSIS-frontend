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
    path: 'registrar',
    loadComponent: () => import('./registrar-usuario/registrar-usuario.component').then(m => m.RegistrarUsuarioComponent),
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {   
    path: 'home',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_ADMIN', 'ROLE_USER', 'ROLE_APPLICANT'] }
  },
  {
    path: 'resultado',
    loadComponent: () => import('./resultado/resultado.component').then(m => m.ResultadoComponent),
    canActivate: [RoleGuard],
    data: { roles: [ 'ROLE_APPLICANT'] }
  },
  { 
    path: 'usuario', 
    component: UsuarioComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: 'cargar',
    loadComponent: () => import('./carga-datos/carga-datos.component')
      .then(m => m.CargaDatosComponent),
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: 'cargarresultados',
    loadComponent: () => import('./carga-datos-resultados/carga-datos-resultados.component')
      .then(m => m.CargaDatosResultadosComponent),
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: 'alumnos',
    loadComponent: () => import('./alumnos/alumnos.component').then(m => m.AlumnosComponent),
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_ADMIN', 'ROLE_USER'] }
  }
];
