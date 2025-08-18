import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AccessRestrictionService } from '../../services/access-restriction.service';
import { AccessRestrictionDTO } from '../../models/access-restriction.model';

// Angular Material imports (ajusta según uses)
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-access-restriction',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
  ],
  templateUrl: './access-restriction.component.html',
})
export class AccessRestrictionComponent {
  form: FormGroup;
  msg = '';

  constructor(private fb: FormBuilder, private svc: AccessRestrictionService) {
    this.form = this.fb.group({
      id: [null],
      roleName: ['ROLE_APPLICANT'],
      startDate: [''],
      endDate: [''],
      startTime: ['09:00'],
      endTime: ['17:00'],
      enabled: [false],
      description: [''],
    });

    this.load();
  }

  load() {
    this.svc.getRestriction().subscribe({
      next: (r) => {
        if (r) {
          this.form.patchValue(r as Partial<AccessRestrictionDTO>);
        }
      },
      error: (err) => {
        console.error('Error al cargar restricción:', err);
      },
    });
  }

  onSave() {
    const payload = this.form.value as AccessRestrictionDTO;
    payload.roleName = payload.roleName || 'ROLE_APPLICANT';

    this.svc.saveRestriction(payload).subscribe({
      next: (saved) => {
        this.msg = 'Restricción guardada';
        if (saved) {
          this.form.patchValue(saved as Partial<AccessRestrictionDTO>);
        }
        setTimeout(() => (this.msg = ''), 3000);
      },
      error: (err) => {
        console.error('Error guardando restricción:', err);
        this.msg = 'Error guardando';
      },
    });
  }
}


/*
import { Component } from '@angular/core';
@Component({
  selector: 'app-access-restriction',
  imports: [],
  templateUrl: './access-restriction.component.html',
  styleUrl: './access-restriction.component.css'
})
export class AccessRestrictionComponent {
}
*/
