import { Component } from '@angular/core';
import { NavComponent } from "../nav/nav.component";
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css'],
  imports: [NavComponent, FooterComponent]
})
export class UsuarioComponent {
  usuario = {
    nombre: 'Usuario UNSIS',
    email: 'usuario@unsis.edu.mx',
    rol: 'Administrador',
    imagen: 'https://flowbite.com/docs/images/people/profile-picture-5.jpg',
    fechaRegistro: '2024-01-01'
  };
}
