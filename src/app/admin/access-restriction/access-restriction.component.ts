import { Component, OnInit } from '@angular/core';
import { AccessRestriction } from '../../models/access-restriction.model';
import { AccessRestrictionService } from '../../services/access-restriction.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';

/**
 * Componente para gestionar las restricciones de acceso de los aspirantes.
 * Permite configurar fechas y horas de activación, así como habilitar/deshabilitar la restricción.
 */
@Component({
  selector: 'app-access-restriction',
  standalone: true,
  templateUrl: './access-restriction.component.html',
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  styleUrls: ['./access-restriction.component.css'],
})
export class AccessRestrictionComponent implements OnInit {
  
  /** Objeto que contiene los datos de la restricción actual */
  restriction: AccessRestriction = this.defaultRestriction();
  
  /** Bandera que indica si se está guardando la restricción */
  saving = false;

  /** Bandera para mostrar/ocultar el diálogo de confirmación */
  showConfirm = false;
  
  /** Mensaje a mostrar en el diálogo de confirmación */
  confirmMessage = '';
  
  /** Función a ejecutar cuando se confirma la acción */
  confirmAction: (() => void) | null = null;

  /**
   * Crea una instancia del componente AccessRestrictionComponent
   * @param restrictionService Servicio para gestionar las restricciones
   * @param router Servicio de enrutamiento
   * @param alertService Servicio para mostrar alertas
   */
  constructor(
    private restrictionService: AccessRestrictionService,
    private router: Router,
    private alertService: AlertService
  ) {}

  /**
   * Carga la restricción al inicializar el componente
   */
  ngOnInit(): void {
    this.loadRestriction();
  }

  /**
   * Crea un objeto AccessRestriction con valores por defecto
   * @returns AccessRestriction con valores iniciales
   */
  private defaultRestriction(): AccessRestriction {
    return {
      id: null,
      roleName: 'ROLE_APPLICANT',
      activationDate: null,
      activationTime: null,
      enabled: false,
      description: null,
    };
  }

  /**
   * Carga la restricción actual desde el servidor
   */
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
  /**
   * Muestra el diálogo de confirmación para habilitar/deshabilitar la restricción
   */
  confirmToggle() {
    if (!this.restriction) return;

    this.confirmMessage = this.restriction.enabled
      ? '¿Quieres deshabilitar esta restricción?'
      : '¿Quieres habilitar esta restricción?';

    this.confirmAction = () => this.toggleEnabled();
    this.showConfirm = true;
  }

  /**
   * Cambia el estado de habilitación de la restricción
   * @private
   */
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
     const newState = !this.restriction.enabled;

  // 👀 LOG

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
  /**
   * Muestra el diálogo de confirmación para guardar la restricción
   */
  confirmSaveRestriction() {
    this.confirmMessage = '¿Quieres guardar esta regla?';
    this.confirmAction = () => this.saveRestriction();
    this.showConfirm = true;
  }

  /**
   * Guarda la restricción en el servidor
   * @private
   */
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
  /**
   * Maneja la respuesta del diálogo de confirmación
   * @param result true si se confirmó la acción, false si se canceló
   */
  onConfirm(result: boolean) {
    this.showConfirm = false;
    if (result && this.confirmAction) {
      this.confirmAction();
    }
    this.confirmAction = null;
  }
}
