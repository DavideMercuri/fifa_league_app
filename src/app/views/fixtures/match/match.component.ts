import { faBolt, faFutbol, faMedal, faPersonRunning, faSquare, faSquarePlus, faSquarePollVertical, faTruckMedical } from '@fortawesome/free-solid-svg-icons';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Input, OnInit, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TuiContextWithImplicit, TuiStringHandler } from '@taiga-ui/cdk';
import { Player } from 'src/interfaces/player.interface';
import { TUI_DEFAULT_MATCHER } from '@taiga-ui/cdk';
import { Observable, of, Subject } from 'rxjs';
import { delay, filter, startWith, switchMap } from 'rxjs/operators';
import { Fixture } from 'src/interfaces/fixture.interfaces';
import { TuiAlertService, TuiNotification } from '@taiga-ui/core';
import { FixturesComponent } from '../fixtures.component';

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

  readonly tabMenu = [
    {
      text: 'Prestazioni',
      icon: faSquarePollVertical
    },
    {
      text: 'Sanzioni / Infortuni',
      icon: faBolt
    }
  ];

  faFutbol = faFutbol;
  faMedal = faMedal;
  faPersonRunning = faPersonRunning;
  faTruckMedical = faTruckMedical;
  faSquarePlus = faSquarePlus;
  faSquare = faSquare;
  activeItemIndex = 0;
  htGoals = '0';
  awGoals = '0';
  tdStyleClass: string = 'tui-table__td tui-table__td_text_center team tui-table__td_first tui-table__td_last';
  search: string | null = '';
  players: Array<PlayerSearch> = [];

  @ViewChild('tuitui') tuitui !: any;
  @ViewChild('tuituiAssist') tuituiAssist !: any;
  @ViewChild('tuicomboMotm') tuicomboMotm !: any;
  @ViewChild('tuituiYellowCard') tuituiYellowCard !: any;
  @ViewChild('tuituiRedCard') tuituiRedCard !: any;
  @ViewChild('tuituiInjured') tuituiInjured !: any;
  @Input() match!: Fixture;
  @Input() observer: any;

  homeTeamInjured: Array<PlayerSearch> = [];
  awayTeamInjured: Array<PlayerSearch> = [];
  homeTeamExpelled: Array<PlayerSearch> = [];
  awayTeamExpelled: Array<PlayerSearch> = [];

  constructor(private http: HttpClient, private cdRef: ChangeDetectorRef, @Inject(TuiAlertService)
  private readonly alerts: TuiAlertService, private fixtures: FixturesComponent) { }

  ngOnInit(): void {

    this.GetPlayers();
    // Iscriviti ai cambiamenti delle selezioni attive e chiama `AddCounter` quando cambiano
    this.activeScorers.valueChanges.subscribe(() => {
      this.AddCounter('scorers', this.activeScorers.value);
    });
    this.activeAssist.valueChanges.subscribe(() => {
      this.AddCounter('assists', this.activeAssist.value);
    });
    this.activeInjured.valueChanges.subscribe(() => {
      this.AddCounter('injured', this.activeInjured.value);
    });
    this.activeRedCards.valueChanges.subscribe(() => {
      this.AddCounter('redCard', this.activeRedCards.value);
    });

  }

  ngAfterViewInit(): void {
    setTimeout(() => (this.SetDefaultData()), 0);

    setTimeout(() => (this.generateArrays()), 0);

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

  readonly activeScorers = new FormControl();
  readonly activeAssist = new FormControl();
  readonly activeMotm = new FormControl();
  readonly activeYellowCards = new FormControl();
  readonly activeRedCards = new FormControl();
  readonly activeInjured = new FormControl();

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

  GetPlayers() {
    this.http.get('http://localhost:3000/players/players_list').subscribe({
      next: (res: any) => {
        this.players = this.SortPlayerByName(res);
      },
    });
  }

  SortPlayerByName(arrayToSort: any): Array<any> {
    return arrayToSort.sort((a: any, b: any) => a.name.localeCompare(b.name));
  }

  logga(){
    console.log(this.tuitui);
  }

  TeamLogo(teamName: string): string {

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

  SetDefaultData() {

    var testo = document.getElementById("tui_interactive_681691675169956");
    if (testo) {
      testo.style.padding = '0';
    }
    if (this.match.played == 'no') {
      return;
    } else {
      const response = this.match;
      const players = this.players;
      const { scorers, assists, motm, yellowCard, redCard, injured, notation_injured, notation_expelled } = this.ProcessGame(response, players);
      this.htGoals = this.match.ht_goals;
      this.awGoals = this.match.aw_goals;
      this.activeScorers.setValue(scorers);
      this.activeAssist.setValue(assists);
      this.AddCounter('scorers', scorers);
      this.AddCounter('assists', assists);
      this.activeMotm.setValue(motm);
      this.activeYellowCards.setValue(yellowCard);
      this.activeRedCards.setValue(redCard);
      this.activeInjured.setValue(injured);
      this.AddCounter('redCard', redCard);
      this.AddCounter('injured', injured);
    }

  }

  SaveMatchData() {

    if (!this.tuicomboMotm.previousInternalValue) {
      this.alerts
        .open('Aggiungere il migliore in campo!', { label: 'MOTM Mancante' }).subscribe();

    } else {
      const scorersArray: Array<any> = [];
      const assistsArray: Array<any> = [];
      const redCardsArray: Array<any> = [];
      const injuredArray: Array<any> = [];
      const motm: any = {
        id: this.tuicomboMotm.previousInternalValue.id,
        name: this.tuicomboMotm.previousInternalValue.name
      }
      let result = {};
      const tuituiTags = document.querySelectorAll('#tuitui tui-tag.modified');
      const tuituiassistTags = document.querySelectorAll('#tuituiAssist tui-tag.modified');
      const tuituiRedCard = document.querySelectorAll('#tuituiRedCard tui-tag.modified');
      const tuituiInjured = document.querySelectorAll('#tuituiInjured tui-tag.modified');
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
      extractData(tuituiRedCard, redCardsArray);
      extractData(tuituiInjured, injuredArray);

      // create result object
      result = {
        idGame: this.match.id_game,
        home_team: this.match.home_team,
        away_team: this.match.away_team,
        htGoals: this.htGoals,
        awGoals: this.awGoals,
        scorers: scorersArray,
        assists: assistsArray,
        motm: motm,
        yellowCards: !this.tuituiYellowCard.previousInternalValue ? [] : this.tuituiYellowCard.previousInternalValue.map(({ id, name }: Player) => ({ id, name })),
        redCards: redCardsArray,
        injured: injuredArray,
        played: 'yes'
      };
      this.http.put(`http://localhost:3000/players/fixture/save-match?id=${this.match.id_game}`, { result }).subscribe({
        complete: () => {
          this.observer.complete();
          this.fixtures.getFixtures();
          this.alerts.open('Modifica Avvenuta con Successo!!', { label: 'Operazione Effettuata', status: TuiNotification.Success }).subscribe();
        }
      });
    }
  }

  ProcessGame(game: any, players: PlayerSearch[]) {
    const processCountedString = (str: string) => {
      if (!str) return [];
      return str.split(',').filter(s => s).map(s => {
        const [idStr, countStr] = s.split('x');
        const player = players.find(p => Number(p.id) == Number(idStr));
        const count = Number(countStr);
        return { id: idStr, name: player?.name || '', count };
      });
    };

    const processSingleId = (str: string) => {
      if (!str) return null;
      const id = Number(str);
      const player = players.find(p => Number(p.id) == Number(id));
      return { id: str, name: player?.name, position: player?.position, photo: player?.photo || '' };
    };

    const processMultipleIds = (str: string) => {
      if (!str) return [];
      return str.split(',').filter(s => s).map(s => {
        const id = Number(s);
        const player = players.find(p => Number(p.id) == Number(id));
        return { id: s, name: player?.name || '' };
      });
    };

    const scorers = processCountedString(game.scorers);
    const assists = processCountedString(game.assists);
    const motm = processSingleId(game.motm);
    const yellowCard = processMultipleIds(game.yellow_card);
    const redCard = processCountedString(game.red_card);
    const injured = processCountedString(game.injured);
    var notation_injured = processCountedString(game.notation_injured);
    var notation_expelled = processCountedString(game.notation_expelled);


    return { scorers, assists, motm, yellowCard, redCard, injured, notation_injured, notation_expelled };
  }


  private getPlayersFromNotations(notation: string, teamName: string) {

    if (!notation) return [];
    const ids = notation.split(',').filter(item => item !== "");    

    return this.players.filter(player => ids.includes(String(player.id)) && player.team === teamName);
  }


  generateArrays() {

    this.homeTeamInjured = this.getPlayersFromNotations(this.match.notation_injured, this.match.home_team);
    this.awayTeamInjured = this.getPlayersFromNotations(this.match.notation_injured, this.match.away_team);

    this.homeTeamExpelled = this.getPlayersFromNotations(this.match.notation_expelled, this.match.home_team);
    this.awayTeamExpelled = this.getPlayersFromNotations(this.match.notation_expelled, this.match.away_team);

  }


  AddCounter(type: 'scorers' | 'assists' | 'redCard' | 'injured', playersCount?: { id: string, count: number }[]) {

    var playerCount: number;
    var tuiTags: any;
    // Aggiungi una chiamata a detectChanges per assicurarti che l'elemento sia completamente renderizzato
    this.cdRef.detectChanges();

    setTimeout(() => {
      if (type == 'scorers') {
        tuiTags = document.querySelectorAll('#tuitui tui-tag:not(.modified)');
      }
      if (type == 'assists') {
        tuiTags = document.querySelectorAll('#tuituiAssist tui-tag:not(.modified)');
      }
      if (type == 'redCard') {
        tuiTags = document.querySelectorAll('#tuituiRedCard tui-tag:not(.modified)');
      }
      if (type == 'injured') {
        tuiTags = document.querySelectorAll('#tuituiInjured tui-tag:not(.modified)');
      }

      // Itera attraverso ogni elemento nella collezione
      for (let i = 0; i < tuiTags.length; i++) {
        const tuiTag = tuiTags[i];
        const playerData = this.FindPlayerDataForTag(tuiTag); // Trova i dati del calciatore corrispondenti al tui-tag

        if (playersCount) {
          // Trova il conteggio corrispondente dall'array playersCount
          const playerCountData = playersCount.find(p => p.id == playerData.id);
          playerCount = playerCountData ? playerCountData.count : 1;
        }

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

        count.textContent = !playerCount ? '1' : playerCount.toString();
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
