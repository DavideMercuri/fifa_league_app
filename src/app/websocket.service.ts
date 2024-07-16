// websocket.service.ts
import { Injectable } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket$: WebSocketSubject<any>;

  constructor() {
    this.socket$ = new WebSocketSubject('ws://localhost:3001');
  }

  get messages$(): Observable<any> {
    return this.socket$.asObservable();
  }

  send(message: any): void {
    this.socket$.next(message);
  }
}
