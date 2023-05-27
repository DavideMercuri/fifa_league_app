import { Component, Inject } from '@angular/core';
import { TuiAlertService } from '@taiga-ui/core';

interface Item {
  text: string;
  icon: string;
  routerLink?: string;
  badge?: number;

}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.less']
})

export class NavbarComponent {

  activeItemIndex = 1;

  readonly items = [
    {
      text: 'Calendario',
      icon: 'tuiIconCalendar',
      routerLink: 'fixtures'
    },
    {
      text: 'Calciatori',
      icon: 'tuiIconUserLarge',
      routerLink: 'players'
    },
    {
      text: 'Classifica',
      icon: 'tuiIconBarChartLarge',
      routerLink: '/fixtures'
    },
    {
      text: 'Squadre',
      icon: 'tuiIconUsersLarge',
      routerLink: '/fixtures'
    },
  ];

  showSubMenu: boolean[] = [];

  showSubmenu(index: number): void {
    this.showSubMenu[index] = true;
  }

  hideSubmenu(index: number): void {
    this.showSubMenu[index] = false;
  }

  constructor(@Inject(TuiAlertService) private readonly alerts: TuiAlertService) { }


}
