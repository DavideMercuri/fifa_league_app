import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, Renderer2, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TuiContextWithImplicit, TuiStringHandler } from '@taiga-ui/cdk';
import { Player } from 'src/interfaces/player.interface';
import { TUI_DEFAULT_MATCHER } from '@taiga-ui/cdk';
import { Observable, of, Subject } from 'rxjs';
import { delay, filter, startWith, switchMap } from 'rxjs/operators';
import { Fixture } from 'src/interfaces/fixture.interfaces';



class PlayerSearch implements Player {
  constructor(
    readonly id: number,
    readonly name: string,
    readonly position: string,
    readonly country: string,
    readonly team: string,
    readonly goals: number,
    readonly assist: number,
    readonly motm: number,
    readonly yellow_card: number,
    readonly red_card: number,
    readonly salary: number,
    readonly overall: number,
    readonly player_value: number,
    readonly photo: string,
  ) { }

  toString(): string {
    return `${this.name}`;
  }

}

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.less'],
})

export class MatchComponent implements OnInit, AfterViewInit {

  @ViewChild('tuitui') tuitui !: ElementRef;
  @ViewChild('tuituiAssist') tuituiAssist !: ElementRef;
  @Input() match!: Fixture;

  constructor(private http: HttpClient, private renderer: Renderer2, private el: ElementRef) { }
  ngAfterViewInit(): void {



  }

  ngOnInit(): void {
    this.getPlayers();
  }



  players: Array<PlayerSearch> = [];

  readonly stringify: TuiStringHandler<PlayerSearch | TuiContextWithImplicit<PlayerSearch>> = item =>

    'name' in item ? item.name : item.$implicit.name;

  readonly search$ = new Subject<string | null>();

  readonly items$: Observable<readonly PlayerSearch[] | null> = this.search$.pipe(
    filter(value => value !== null),
    switchMap(search =>
      this.serverRequest(search).pipe(startWith<readonly PlayerSearch[] | null>(null)),
    ),
    startWith(this.players),
  );
  readonly activeScorers = new FormControl();
  readonly activeAssist = new FormControl();

  onSearchChange(searchQuery: string | null): void {

    this.search$.next(searchQuery);


  }

  private serverRequest(searchQuery: string | null): Observable<readonly PlayerSearch[]> {
    const result = this.players.filter(user =>
      TUI_DEFAULT_MATCHER(user.name, searchQuery || ''),
    );

    return of(result).pipe(delay(200));
  }

  getPlayers() {
    this.http.get('http://localhost:3000/players/players_list').subscribe({
      next: (res: any) => {
        this.players = res;
      },
    });
  }

  teamLogo(teamName: string): string {

    switch (teamName) {
      case 'Werder Brema':
        return 'https://i.imgur.com/qZ2N0Pd.png';
      case 'Real Madrid':
        return 'https://i.imgur.com/epsvCFz.png';
      case 'West Ham':
        return 'https://i.imgur.com/tZa7KjX.png';
      default:
        return '';
    }
  }

  assist: Array<Player> = [];

  print(param: any) {


    if (param.previousInternalValue) {
      param.previousInternalValue.forEach((players: Player) => {
        if (!this.assist.includes(players))
          this.assist.push(players);
      });
    }

    // Trova tutti gli elementi con il tag 'tui-tag'
    const tuiTags = document.getElementsByTagName('tui-tag');

    // SVG content for plus and minus icons
    const plusSVGContent = '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path fill="white" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>';
    const minusSVGContent = '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path fill="white" d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"/></svg>';

    const buttonStyle = 'color: white; background-color: transparent; border: none;';

    // Itera attraverso ogni elemento nella collezione
    for (let i = 0; i < tuiTags.length; i++) {
      const tuiTag = tuiTags[i];
      const divElement = tuiTag.querySelector('div');
      const spanElement = divElement ? divElement.querySelector('span') : null;
      const closeButton = tuiTag.querySelector('svg[class="t-svg ng-star-inserted"]');

      // Crea il contatore
      const count = document.createElement('span');
      count.textContent = '1';

      // Crea un pulsante con l'icona specificata
      const createButtonWithIcon = (svgContent: string, onClick: () => void) => {
        const button = document.createElement('button');
        button.setAttribute('style', buttonStyle);
        const icon = document.createElement('tui-svg');
        icon.innerHTML = svgContent;
        button.appendChild(icon);
        button.addEventListener('click', onClick);
        return button;
      };

      const plusButton = createButtonWithIcon(plusSVGContent, () => {
        count.textContent = (parseInt(count.textContent!, 10) + 1).toString();
      });

      const minusButton = createButtonWithIcon(minusSVGContent, () => {
        const newCount = parseInt(count.textContent!, 10) - 1;
        count.textContent = newCount.toString();
        if (newCount < 1 && closeButton) {
          const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
          });
          closeButton.dispatchEvent(clickEvent);
        }
      });

      if (divElement && spanElement) {
        divElement.insertBefore(plusButton, spanElement.nextSibling);
        divElement.insertBefore(minusButton, plusButton.nextSibling);
        divElement.insertBefore(count, minusButton.nextSibling);
      }
    }

  }

}
