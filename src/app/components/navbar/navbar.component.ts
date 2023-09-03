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

  constructor(private router: Router, public authService: AuthService) {}

  ngAfterViewInit(): void {

    setTimeout(() => {
    // Ad esempio, per rimuovere tutti gli attributi che iniziano con "_nghost" da un elemento con ID "myElement":
    const element = document.getElementById('navbar-custom');
    if (element) {
      this.removeAttributesStartingWith(element, "_nghost");
    }
    },0)

  }

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
      routerLink: '/league-table'
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

}
