import { Component, OnInit } from '@angular/core';
import { AlertService, Alert } from '../services/alert.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  imports: [CommonModule],
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {
  alerts: Alert[] = [];

  constructor(private alertService: AlertService) {}

  ngOnInit() {
    this.alertService.alerts$.subscribe(alerts => {
      this.alerts = alerts;
    });
  }
}
