import { Component, Inject, NgModule } from '@angular/core';
import { TuiActionModule } from '@taiga-ui/kit';
import { TuiAlertService } from '@taiga-ui/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})


export class AppComponent {
  title = 'fifa_league_app';

  constructor(@Inject(TuiAlertService)
  private readonly alertService: TuiAlertService,) {

  }
}
