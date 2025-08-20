import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-restricted',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './restricted.component.html',
  styleUrl: './restricted.component.css',
})
export class RestrictedComponent {}
