import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, Renderer2, Input, OnInit, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TuiContextWithImplicit, TuiDestroyService, TuiStringHandler } from '@taiga-ui/cdk';
import { Player } from 'src/interfaces/player.interface';
import { TUI_DEFAULT_MATCHER } from '@taiga-ui/cdk';
import { Observable, of, Subject } from 'rxjs';
import { delay, filter, startWith, switchMap } from 'rxjs/operators';
import { Fixture } from 'src/interfaces/fixture.interfaces';



class PlayerSearch implements Player {
  constructor(
    readonly id: string,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MatchComponent implements OnInit, AfterViewInit {

  value = null;
  search: string | null = '';
  players: Array<PlayerSearch> = [];

  @ViewChild('tuitui') tuitui !: ElementRef;
  @ViewChild('tuituiAssist') tuituiAssist !: ElementRef;
  @ViewChild('tuicomboMotm') tuicomboMotm !: any;
  @Input() match!: Fixture;

  constructor(private http: HttpClient, private cdRef: ChangeDetectorRef) { }

  ngAfterViewInit(): void { }

  ngOnInit(): void {
    this.GetPlayers();
    // Iscriviti ai cambiamenti delle selezioni attive e chiama `AddCounter` quando cambiano
    this.activeScorers.valueChanges.subscribe(() => {
      this.AddCounter(this.tuitui);
    });
    this.activeAssist.valueChanges.subscribe(() => {
      this.AddCounter(this.tuituiAssist);
    });
  }

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

  readonly itemsMotm$ = of(this.players).pipe(delay(200));
  readonly activeScorers = new FormControl();
  readonly activeAssist = new FormControl();
  readonly activeMotm = new FormControl();

  onSearchChange(searchQuery: string | null): void {
    this.search$.next(searchQuery);
  }

  extractValueFromEvent(event: Event): string | null {
    return (event.target as HTMLInputElement)?.value || null;
  }

  private serverRequest(searchQuery: string | null): Observable<readonly PlayerSearch[]> {
    const result = this.players.filter(user =>
      TUI_DEFAULT_MATCHER(user.name, searchQuery || ''),
    );

    return of(result).pipe(delay(200));
  }

  GetPlayers(arrayToFill?: any) {
    this.http.get('http://localhost:3000/players/players_list').subscribe({
      next: (res: any) => {
        if (arrayToFill) {
          arrayToFill = this.SortPlayerByName(res);
        } else {
          this.players = this.SortPlayerByName(res);
        }
      },
    });
  }

  SortPlayerByName(arrayToSort: any): Array<any> {
    return arrayToSort.sort((a: any, b: any) => a.name.localeCompare(b.name));
  }

  TeamLogo(teamName: string): string {

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

  SaveMatchData() {

    const scorersArray: Array<any> = [];
    const assistsArray: Array<any> = [];
    const motm: any = {
      id: this.tuicomboMotm.previousInternalValue.id,
      name: this.tuicomboMotm.previousInternalValue.name
    }

    const tuituiTags = document.querySelectorAll('#tuitui tui-tag.modified');
    const tuituiassistTags = document.querySelectorAll('#tuituiAssist tui-tag.modified');

    const extractData = (tuiTags: NodeListOf<Element>, arrayToFill: any[]) => {
      for (let i = 0; i < tuiTags.length; i++) {
        const tuiTag = tuiTags[i];
        const id = tuiTag.getAttribute('data-id');
        const name = tuiTag.getAttribute('data-name');
        const counter = tuiTag.querySelector('span.counter')?.textContent || '0';

        arrayToFill.push({
          id: id,
          name: name,
          counter: counter
        });
      }
    };

    // Estrai i dati dai tui-tags per marcatori e assist
    extractData(tuituiTags, scorersArray);
    extractData(tuituiassistTags, assistsArray);


    // Metti insieme i dati in un oggetto unico
    const result = {
      scorers: scorersArray,
      assists: assistsArray,
      motm: motm
    };

    console.log(result);

  }

  AddCounter(param: any) {
    // Aggiungi una chiamata a detectChanges per assicurarti che l'elemento sia completamente renderizzato
    this.cdRef.detectChanges();

    setTimeout(() => {
      const tuiTags = document.querySelectorAll('tui-tag:not(.modified)');

      // Itera attraverso ogni elemento nella collezione
      for (let i = 0; i < tuiTags.length; i++) {
        const tuiTag = tuiTags[i];
        const playerData = this.FindPlayerDataForTag(tuiTag); // Trova i dati del calciatore corrispondenti al tui-tag

        // Imposta gli attributi data-id e data-name
        tuiTag.setAttribute('data-id', playerData.id);
        tuiTag.setAttribute('data-name', playerData.name);

        // Il resto del codice per aggiungere il contatore e i pulsanti
        const divElement = tuiTag.querySelector('div');
        const closeButton = tuiTag.querySelector('svg[class="t-svg ng-star-inserted"]');
        const plusSVGContent = '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path fill="white" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3-32-32s-14.3-32-32-32H256V80z"/></svg>';
        const minusSVGContent = '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path fill="white" d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"/></svg>';
        const buttonStyle = 'color: white; background-color: transparent; border: none;';

        const count = document.createElement('span');
        count.textContent = '1';
        count.classList.add('counter');

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

        if (divElement) {
          divElement.appendChild(plusButton);
          divElement.appendChild(minusButton);
          divElement.appendChild(count);
        }

        // Aggiungi la classe 'modified' all'elemento per indicare che è stato modificato
        tuiTag.classList.add('modified');
      }
    }, 0);
  }

  private FindPlayerDataForTag(tuiTag: Element): PlayerSearch {
    // Trova l'elemento che contiene il nome del giocatore
    const playerNameElement = tuiTag.querySelector('[automation-id="tui-tag__text"]');

    // Controlla se l'elemento esiste prima di accedere alla proprietà textContent
    if (!playerNameElement) {
      throw new Error('Player name element not found');
    }

    const playerName = playerNameElement.textContent;

    // Trova il giocatore corrispondente nell'array dei giocatori
    const player = this.players.find(p => p.name === playerName);

    if (!player) {
      throw new Error(`Player not found for name ${playerName}`);
    }

    return player;
  }
}
