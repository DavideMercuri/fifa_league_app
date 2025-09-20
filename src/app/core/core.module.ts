import { CommonModule } from '@angular/common';
import { DataService } from './services/data.service';
import { ScrollToNotPlayedDirective } from './services/scroll-to-not-played.directive';
import { SubMenuVoicesService } from './services/sub-menu-voices.service';
import { WebsocketService } from './services/websocket.service';
import { NgModule, Optional, SkipSelf } from '@angular/core';

@NgModule({
  imports: [ CommonModule ],
  providers: [
    DataService,
    SubMenuVoicesService,
    WebsocketService,
    { provide: ScrollToNotPlayedDirective, useClass: ScrollToNotPlayedDirective },
  ]
})

export class CoreModule {
  constructor(@Optional() @SkipSelf() parent: CoreModule) {
    if (parent) {
      throw new Error('CoreModule already imported.');
    }
  }
}