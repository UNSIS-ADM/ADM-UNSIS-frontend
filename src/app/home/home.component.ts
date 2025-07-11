import { Component } from '@angular/core';
import { NavComponent } from "../nav/nav.component";
import { FooterComponent } from "../footer/footer.component";
import { AuthService } from '../services/auth.service'; // Asegúrate de tener este servicio

@Component({
  selector: 'app-home',
  imports: [NavComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  nombreUsuario: string = 'Juan Pérez'; // Valor por defecto, se puede cambiar dinámicamente


  
}
