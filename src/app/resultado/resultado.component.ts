import { Component } from '@angular/core';
import { NavComponent } from "../nav/nav.component";
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-resultado',
  imports: [NavComponent, MatCardModule],
  templateUrl: './resultado.component.html',
  styleUrl: './resultado.component.css'
})
export class ResultadoComponent {

}
