import { Component, OnInit } from '@angular/core';
import { AccessRestriction } from '../../models/access-restriction.model';
import { AccessRestrictionService } from '../../services/access-restriction.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-access-restriction',
  standalone: true,
  templateUrl: './access-restriction.component.html',
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  styleUrls: ['./access-restriction.component.css'],
})
export class AccessRestrictionComponent implements OnInit {
  restriction: AccessRestriction | null = null;
  loading = true;
  saving = false;

  // Para el modal de confirmación
  showConfirm = false;
  confirmMessage = '';
  confirmAction: (() => void) | null = null;

  constructor(
    private restrictionService: AccessRestrictionService,
    private router: Router,
    private alertService: AlertService
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
        this.alertService.showAlert('Error al cargar la restricción', 'danger');
      },
    });
  }

  // ===================== TOGGLE =====================
  confirmToggle() {
    if (!this.restriction) return;

    this.confirmMessage = this.restriction.enabled
      ? '¿Quieres deshabilitar esta restricción?'
      : '¿Quieres habilitar esta restricción?';

    this.confirmAction = () => this.toggleEnabled();
    this.showConfirm = true;
  }

  private toggleEnabled() {
    if (!this.restriction || !this.restriction.id) return;

    this.restrictionService
      .toggleEnabled(this.restriction.id, !this.restriction.enabled)
      .subscribe({
        next: (res) => {
          this.restriction = res;
          this.alertService.showAlert(
            this.restriction.enabled
              ? 'Restricción habilitada'
              : 'Restricción deshabilitada',
            'success'
          );
        },
        error: (err) => {
          console.error(err);
          this.alertService.showAlert(
            'Error al cambiar el estado de la restricción',
            'danger'
          );
        },
      });
  }

  // ===================== SAVE =====================
  confirmSaveRestriction() {
    this.confirmMessage = '¿Quieres guardar esta regla?';
    this.confirmAction = () => this.saveRestriction();
    this.showConfirm = true;
  }

  private saveRestriction() {
    if (!this.restriction) return;

    this.saving = true;

    this.restrictionService.saveOrUpdate(this.restriction).subscribe({
      next: (res) => {
        this.restriction = res;
        this.saving = false;

        this.alertService.showAlert(
          'Restricción guardada exitosamente',
          'success'
        );
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error(err);
        this.saving = false;
        this.alertService.showAlert(
          'Error al guardar la restricción',
          'danger'
        );
      },
    });
  }

  // ===================== CONFIRM DIALOG HANDLER =====================
  onConfirm(result: boolean) {
    this.showConfirm = false;
    if (result && this.confirmAction) {
      this.confirmAction();
    }
    this.confirmAction = null;
  }
}
