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

  // roles disponibles
  availableRoles = ['ROLE_ADMIN', 'ROLE_USER', 'ROLE_APPLICANT'];

  /*
  form: AdminUser = {
    username: '',
    fullName: '',
    password: '',
    roles: [],
    active: true,
  };*/

  constructor(private adminUserService: AdminUserService) {}

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

  /*
  loadUsers() {
    this.adminUserService.getAll().subscribe({
      next: (res) => (this.users = res),
    });
  }*/
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

  /*
  edit(user: AdminUser) {
    this.form = { ...user, password: '' };
    this.showForm = true;
  }*/
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

  /*
  newUser() {
    this.form = {
      username: '',
      fullName: '',
      password: '',
      confirmPassword: '',
      roles: [],
      active: true,
    };
    this.showForm = true;
  }*/
  newUser() {
    this.form = this.emptyForm();
    this.confirmPassword = '';
    this.showForm = true;
  }

  /*save() {
    this.adminUserService.save(this.form).subscribe({
      next: () => {
        this.showForm = false;
        this.loadUsers();
      },
    });
  }
  save() {
    if (this.form.password && this.form.password !== this.confirmPassword) {
      alert('❌ Las contraseñas no coinciden');
      return;
    }

    if (this.form.roles.length === 0) {
      alert('⚠️ Debe asignar al menos un rol');
      return;
    }

    const confirm = window.confirm(
      this.form.id ? '¿Guardar cambios del usuario?' : '¿Crear nuevo usuario?'
    );

    if (!confirm) return;

    this.adminUserService.save(this.form).subscribe(() => {
      alert('✅ Usuario guardado correctamente');
      this.loadUsers();
      this.showForm = false;
    });
  }
  // Guardar usuario con validación y confirm
  save() {
    // Validaciones básicas
    if (!this.form.username || this.form.username.trim().length < 3) {
      window.alert(
        'El username es requerido y debe tener al menos 3 caracteres.'
      );
      return;
    }
    if (!this.form.fullName || this.form.fullName.trim().length === 0) {
      window.alert('El nombre completo es requerido.');
      return;
    }

    // Si se ingresó password, confirmar que coincida con confirmPassword
    if (this.form.password && this.form.password.length > 0) {
      if (this.form.password !== this.confirmPassword) {
        window.alert('Las contraseñas no coinciden.');
        return;
      }
      // opcional: validación de seguridad de la contraseña (largo, mayúsculas, etc.)
      if (this.form.password.length < 6) {
        const ok = window.confirm(
          'La contraseña es muy corta (menos de 6 caracteres). ¿Deseas continuar?'
        );
        if (!ok) return;
      }
    }

    // Validación de roles
    if (!this.form.roles || this.form.roles.length === 0) {
      window.alert('Debes asignar al menos un rol al usuario.');
      return;
    }

    const action = this.form.id
      ? '¿Guardar los cambios del usuario?'
      : '¿Crear nuevo usuario?';
    const proceed = window.confirm(action);
    if (!proceed) return;

    this.adminUserService.save(this.form).subscribe({
      next: (res) => {
        window.alert('Usuario guardado correctamente.');
        this.showForm = false;
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
        window.alert(err?.error || err?.message || 'Error al guardar usuario');
      },
    });
  }*/

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

  /*
  toggle(user: AdminUser) {
    this.adminUserService.changeStatus(user.id!, !user.active).subscribe({
      next: () => (user.active = !user.active),
    });
  }
  toggle(u: any) {
    const action = u.active ? 'desactivar' : 'activar';

    const confirm = window.confirm(
      `¿Seguro que deseas ${action} al usuario ${u.username}?`
    );

    if (!confirm) return;

    this.adminUserService.changeStatus(u.id, !u.active).subscribe(() => {
      this.loadUsers();
    });
  }
  // Activar / desactivar con confirmación
  toggle(user: AdminUser) {
    // protección extra: evitar que el admin se desactive a sí mismo (si guardas username en localStorage)
    const currentUsername = localStorage.getItem('username');
    if (user.username === currentUsername && user.active) {
      window.alert('No puede desactivar su propia cuenta.');
      return;
    }

    const action = user.active ? 'desactivar' : 'activar';
    const ok = window.confirm(
      `¿Seguro que deseas ${action} al usuario ${user.username}?`
    );
    if (!ok) return;

    this.adminUserService.changeStatus(user.id!, !user.active).subscribe({
      next: () => {
        window.alert(`Usuario ${action}o correctamente.`);
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
        window.alert(err?.error || err?.message || 'Error al cambiar estado');
      },
    });
  }*/
  toggle(user: AdminUser) {
  const action = user.active ? 'desactivar' : 'activar';
  this.openConfirm(
    'Confirmar',
    `¿Seguro que deseas ${action} al usuario ${user.username}?`,
    () => {
      this.adminUserService.changeStatus(user.id!, !user.active).subscribe({
        next: () => {
          this.showSnackbar(`Usuario ${action}o correctamente`);
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

  /*toggleRole(role: string) {
    if (this.hasRole(role)) {
      this.form.roles = this.form.roles.filter((r) => r !== role);
    } else {
      this.form.roles.push(role);
    }
  }*/

  /*
  toggleRole(role: string) {
    const alreadyHas = this.form.roles.includes(role);

    if (!alreadyHas) {
      const label = role === 'ROLE_ADMIN' ? 'Administrador' : 'Secretaria';

      const confirm = window.confirm(
        `¿Seguro que deseas asignar el rol ${label}?`
      );

      if (!confirm) return;

      this.form.roles.push(role);
    } else {
      this.form.roles = this.form.roles.filter((r) => r !== role);
    }
  }
  // toggle role con confirmación al agregar (para ADMIN/SECRETARIA)
  toggleRole(role: string) {
    const already = this.hasRole(role);

    if (!already) {
      // Si se está asignando ROLE_ADMIN o ROLE_USER pedir confirmación
      if (role === 'ROLE_ADMIN' || role === 'ROLE_USER') {
        const label = role === 'ROLE_ADMIN' ? 'Administrador' : 'Secretaria';
        const ok = window.confirm(
          `¿Seguro que deseas asignar el rol ${label}?`
        );
        if (!ok) return;
      }
      this.form.roles = [...(this.form.roles || []), role];
    } else {
      this.form.roles = (this.form.roles || []).filter((r) => r !== role);
    }
  }*/
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
}
