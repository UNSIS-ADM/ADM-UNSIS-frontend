import { Routes } from '@angular/router';
import { UsuarioComponent } from './usuario/usuario.component';

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
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'resultado',
        loadComponent: () => import('./resultado/resultado.component').then(m => m.ResultadoComponent)
    },
    { path: 'usuario', component: UsuarioComponent }
];
