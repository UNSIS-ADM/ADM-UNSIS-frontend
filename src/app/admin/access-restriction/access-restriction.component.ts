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
  // Inicializamos con objeto por defecto (campos null) para mostrar siempre los inputs
  restriction: AccessRestriction = this.defaultRestriction();
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

  private defaultRestriction(): AccessRestriction {
    return {
      id: null,
      roleName: 'ROLE_APPLICANT',
      startDate: null,
      endDate: null,
      startTime: null,
      endTime: null,
      enabled: false,
      description: null,
    };
  }

  loadRestriction() {
    this.restrictionService.getRestriction().subscribe({
      next: (res) => {
        // si el backend devuelve null por alguna razón, usar default;
        // si devuelve DTO con campos null, se asignan directamente
        this.restriction = res ?? this.defaultRestriction();
      },
      error: (err) => {
        console.error(err);
        this.alertService.showAlert('Error al cargar la restricción', 'danger');
        // mantener default en caso de error
        this.restriction = this.defaultRestriction();
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
    if (!this.restriction || !this.restriction.id) {
      // Si no existe id y quieres crear la regla al activar, podrías hacerlo aquí.
      // Por ahora, si no hay id no hacemos toggle.
      this.alertService.showAlert(
        'No hay una restricción guardada para togglear',
        'warning'
      );
      return;
    }

    this.restrictionService
      .toggleEnabled(this.restriction.id, !this.restriction.enabled)
      .subscribe({
        next: (res) => {
          this.restriction = res ?? this.restriction;
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
        this.restriction = res ?? this.restriction;
        this.saving = false;
        this.alertService.showAlert(
          'Restricción guardada exitosamente',
          'success'
        );
        this.router.navigate(['/restriction']);//Debe quedarse en la tuta
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
