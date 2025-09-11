import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-session-modal',
  standalone: true,
  templateUrl: './session-modal.component.html',
  styleUrls: ['./session-modal.component.css']
})
export class SessionModalComponent {
  @Output() extend = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
