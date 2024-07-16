// notification.component.ts
import { Component, OnInit } from '@angular/core';
import { TuiAlertService, TuiNotification } from '@taiga-ui/core';
import { WebsocketService } from 'src/app/websocket.service';

@Component({
  selector: 'app-notification',
  template: '',
})
export class NotificationComponent implements OnInit {
  constructor(
    private websocketService: WebsocketService,
    private notificationsService: TuiAlertService
  ) {}

  ngOnInit() {
    this.websocketService.messages$.subscribe((message) => {
      const { status, message: text } = message;
      let notificationStatus: TuiNotification;

      switch (status) {
        case 'success':
          notificationStatus = TuiNotification.Success;
          break;
        case 'warning':
          notificationStatus = TuiNotification.Warning;
          break;
        case 'danger':
          notificationStatus = TuiNotification.Error;
          break;
        default:
          notificationStatus = TuiNotification.Info;
          break;
      }

      this.notificationsService.open(text, { label: 'Info Backup', status: notificationStatus, autoClose: false }).subscribe();

    });
  }
}
