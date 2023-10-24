import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';

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

export class NavbarComponent implements AfterViewInit {

  isvisible: boolean = false;
  activeItemIndex = 1;
  itemsTeams: Array<any> = [];

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
      routerLink: '/league-table'
    },
    {
      text: 'Squadre',
      icon: 'tuiIconUsersLarge',
      routerLink: '',
      subMenu: [
        { text: 'Arsenal', routerLink: 'team-detail/2' },
        { text: 'Real Madrid', routerLink: 'team-detail/1' },
        { text: 'Borussia Dortmund', routerLink: 'team-detail/3' },
      ]
    },
  ];

  constructor(private router: Router, public authService: AuthService) { }

  ngAfterViewInit(): void {

    setTimeout(() => {
      // Ad esempio, per rimuovere tutti gli attributi che iniziano con "_nghost" da un elemento con ID "myElement":
      const element = document.getElementById('navbar-custom');
      if (element) {
        this.removeAttributesStartingWith(element, "_nghost");
      }
    }, 0);
  }

  showSubMenu: boolean[] = [];

  showSubmenu(i: number): void {
    clearTimeout(this.hideDelayTimer);
    this.showSubMenu[i] = true;
  }

  private hideDelayTimer: any;

  hideSubmenu(i: number): void {
    this.hideDelayTimer = setTimeout(() => {
      this.showSubMenu[i] = false;
    }, 100);
  }

  handleMouseEnterOnContainer(item: any, i: number): void {
    if (item.text !== 'Squadre') {
      this.hideSubmenuImmediately(i);  // Nota questa nuova funzione
    } else {
      this.showSubmenu(i);
    }
  }

  hideSubmenuImmediately(i: number): void {
    this.showSubMenu[i] = false;
  }


  logout(): void {
    this.authService.logout();  // Esegui il logout dal servizio
    this.router.navigate(['/login']);  // Reindirizza all'utente alla pagina di login
  }

  removeAttributesStartingWith(element: Element, prefix: string): void {
    // Ottieni tutti gli attributi dell'elemento
    const attributes = Array.from(element.attributes);

    // Filtra gli attributi che iniziano con il prefisso e rimuovili
    attributes.forEach(attribute => {
      if (attribute.name.startsWith(prefix)) {
        element.removeAttribute(attribute.name);
      }
    });
  }

  teamLogo(teamName: string): string {

    switch (teamName) {
      case 'Arsenal':
        return 'https://i.imgur.com/jHecsme.png';
      case 'Real Madrid':
        return 'https://i.imgur.com/epsvCFz.png';
      case 'Borussia Dortmund':
        return 'https://i.imgur.com/3U25w5z.png';
      default:
        return '';
    }
  }

}
