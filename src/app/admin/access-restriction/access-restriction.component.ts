import { Component, OnInit } from '@angular/core';
import { AccessRestriction } from '../../models/access-restriction.model';
import { AccessRestrictionService } from '../../services/access-restriction.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Importar Router para redirección

@Component({
  selector: 'app-access-restriction',
  standalone: true,
  templateUrl: './access-restriction.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./access-restriction.component.css'],
})
export class AccessRestrictionComponent implements OnInit {
  restriction: AccessRestriction | null = null;
  loading = true;
  saving = false; // Nuevo estado para controlar el guardado

  constructor(
    private restrictionService: AccessRestrictionService,
    private router: Router // Inyectar Router
  ) {}

  ngOnInit(): void {
    this.loadRestriction();
  }

  loadRestriction() {
    this.restrictionService.getRestriction().subscribe({
      next: (res) => {
        this.restriction = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        alert('Error al cargar la restricción');
      },
    });
  }

  toggleEnabled() {
    if (!this.restriction || !this.restriction.id) return;

    this.restrictionService
      .toggleEnabled(this.restriction.id, !this.restriction.enabled)
      .subscribe({
        next: (res) => {
          this.restriction = res;
          alert(
            `Restricción ${
              res.enabled ? 'activada' : 'desactivada'
            } correctamente`
          );
        },
        error: (err) => {
          console.error(err);
          alert('Error al cambiar el estado de la restricción');
        },
      });
  }

  saveRestriction() {
    if (!this.restriction) return;

    this.saving = true; // Activar estado de guardado

    this.restrictionService.saveOrUpdate(this.restriction).subscribe({
      next: (res) => {
        this.restriction = res;
        this.saving = false;
        alert('Restricción guardada correctamente');
        this.router.navigate(['/home']); // Redirigir al home
      },
      error: (err) => {
        console.error(err);
        this.saving = false;
        alert('Error al guardar la restricción');
      },
    });
  }
}
