import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubMenuVoicesService {

  // Usa un Subject per innesco
  public triggerNavbarUpdate = new Subject<void>();

  constructor() { }

  // Metodo per attivare l'aggiornamento
  public requestNavbarUpdate() {
    this.triggerNavbarUpdate.next();
  }
}