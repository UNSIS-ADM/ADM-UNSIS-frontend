import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminUserService } from '../services/admin-user.service';
import { AdminUser } from '../models/admin-user.model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';



@Component({
  selector: 'app-gestion-usuarios',
  imports: [
    CommonModule, // *ngIf, *ngFor, ngClass
    FormsModule, // ngModel
    ConfirmDialogComponent, // Componente de diálogo de confirmación
  ],
  standalone: true,
  templateUrl: './gestion-usuarios.component.html',
  styleUrl: './gestion-usuarios.component.css',
})
export class GestionUsuariosComponent implements OnInit {
  users: AdminUser[] = [];
  loading = false;
  error = '';
  console = '';

  // modal / form state
  showForm = false;
  form: AdminUser = this.emptyForm();
  confirmPassword = ''; // <--- aquí estaba el error: propiedad necesaria
showPassword = false;
showConfirmPassword = false; // Añade esta línea
  // roles disponibles
  availableRoles = ['ROLE_ADMIN', 'ROLE_USER', 'ROLE_APPLICANT'];



  constructor(private adminUserService: AdminUserService) {
    
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  emptyForm(): AdminUser {
    return {
      username: '',
      fullName: '',
      password: '',
      roles: [],
      active: true,
    };
  }


  loadUsers() {
    this.loading = true;
    this.error = '';
    this.adminUserService.getAll().subscribe({
      next: (res) => {
        this.users = res;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error || err?.message || 'Error al cargar usuarios';
        this.loading = false;
      },
    });
  }


  edit(user: AdminUser) {
    // copiado defensivo: no pasamos la referencia original
    this.form = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      // dejamos password vacío para que no sobrescriba si no se cambia
      password: '',
      roles: Array.isArray(user.roles) ? [...user.roles] : [],
      active: user.active,
    };
    this.confirmPassword = '';
    this.showForm = true;
  }


  newUser() {
    this.form = this.emptyForm();
    this.confirmPassword = '';
    this.showForm = true;
  }

  save() {
    if (this.form.password && this.form.password !== this.confirmPassword) {
      this.openConfirm('Error', 'Las contraseñas no coinciden', () => {});
      return;
    }

    // validaciones...
    this.openConfirm(
      this.form.id ? 'Guardar cambios' : 'Crear usuario',
      this.form.id
        ? '¿Deseas guardar los cambios?'
        : '¿Deseas crear este usuario?',
      () => {
        this.adminUserService.save(this.form).subscribe({
          next: () => {
            this.showForm = false;
            this.showSnackbar('Usuario guardado correctamente');
            this.loadUsers();
          },
          error: (err) =>
            this.openConfirm(
              'Error',
              err?.error || err?.message || 'Error al guardar',
              () => {}
            ),
        });
      }
    );
  }


  toggle(user: AdminUser) {
  const action = user.active ? 'desactivado' : 'activado';
  this.openConfirm(
    'Confirmar',
    `¿Seguro que deseas ${action} al usuario ${user.username}?`,
    () => {
      this.adminUserService.changeStatus(user.id!, !user.active).subscribe({
        next: () => {
          this.showSnackbar(`Usuario ${action} correctamente`);
          this.loadUsers();
        },
        error: (err) => this.openConfirm('Error', err?.error || err?.message || 'Error al cambiar estado', () => {})
      });
    }
  );
}


  hasRole(role: string): boolean {
    return this.form.roles.includes(role);
  }

 toggleShowPassword() {
  this.showPassword = !this.showPassword;
}

toggleShowConfirmPassword() { // Añade esta función
  this.showConfirmPassword = !this.showConfirmPassword;
}
  toggleRole(role: string) {
    const already = this.form.roles?.includes(role);

    if (!already) {
      if (role === 'ROLE_ADMIN' || role === 'ROLE_USER') {
        const label = role === 'ROLE_ADMIN' ? 'Administrador' : 'Secretaria';
        this.openConfirm(
          'Asignar rol',
          `¿Seguro que deseas asignar el rol ${label}?`,
          () => {
            this.form.roles = [...(this.form.roles || []), role];
            this.showSnackbar(`Rol ${label} asignado`);
          }
        );
        return;
      }
      this.form.roles = [...(this.form.roles || []), role];
    } else {
      this.form.roles = (this.form.roles || []).filter((r) => r !== role);
    }
  }

  // control del diálogo
  dialogVisible = false;
  dialogTitle = '';
  dialogMessage = '';
  private dialogConfirmCallback: (() => void) | null = null;

  // snackbar (toast) simple
  snackbarMessage = '';
  snackbarVisible = false;

  showSnackbar(msg: string, ms = 2500) {
    this.snackbarMessage = msg;
    this.snackbarVisible = true;
    setTimeout(() => (this.snackbarVisible = false), ms);
  }

  // abrir diálogo con callback
  openConfirm(title: string, message: string, onConfirm: () => void) {
    this.dialogTitle = title;
    this.dialogMessage = message;
    this.dialogConfirmCallback = onConfirm;
    this.dialogVisible = true;
  }

  onDialogConfirm() {
    this.dialogVisible = false;
    if (this.dialogConfirmCallback) {
      const cb = this.dialogConfirmCallback;
      this.dialogConfirmCallback = null;
      cb();
    }
  }

  onDialogCancel() {
    this.dialogVisible = false;
    this.dialogConfirmCallback = null;
  }
  
roleLabels: { [key: string]: string } = {
  'ROLE_ADMIN': 'Administrador',
  'ROLE_APPLICANT': 'Aspirante',
  'ROLE_USER': 'Secretaria'
};
}
