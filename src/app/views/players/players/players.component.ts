import { HttpClient, HttpParams } from '@angular/common/http';
import { AfterViewInit, ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TuiComparator } from '@taiga-ui/addon-table';
import { TUI_DEFAULT_MATCHER, tuiDefaultSort, tuiIsFalsy, tuiIsPresent } from '@taiga-ui/cdk';
import { TUI_ARROW } from '@taiga-ui/kit';
import { BehaviorSubject, combineLatest, Observable, timer } from 'rxjs';
import { debounceTime, filter, map, share, startWith, switchMap } from 'rxjs/operators';
import { Player } from 'src/interfaces/player.interface';
import { faFutbol, faIdCard, faMagnifyingGlass, faMedal, faPenToSquare, faPersonRunning, faPlus, faShieldHalved, faStar, faTrashCan, faUser } from '@fortawesome/free-solid-svg-icons';
import { DataService } from 'src/app/data.service';
import { TuiAlertService, TuiDialogContext, TuiDialogService, TuiDialogSize, TuiNotification } from '@taiga-ui/core';
import { PolymorpheusContent } from '@tinkoff/ng-polymorpheus';


type Key = 'name' | 'overall' | 'position' | 'team' | 'goals' | 'assist' | 'motm' | 'yellow_card' | 'red_card';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,

})

export class PlayersComponent implements OnInit, AfterViewInit {

  constructor(private http: HttpClient, private dataService: DataService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    @Inject(TuiAlertService) private readonly alerts: TuiAlertService) { }

  itemsRoles: Array<string> = [];
  itemsTeams: Array<string> = [];

  players: Array<Player> = [];
  teams: any;

  faUser = faUser;
  faFutbol = faFutbol;
  faMedal = faMedal;
  faPersonRunning = faPersonRunning;
  faShieldHalved = faShieldHalved;
  faPenToSquare = faPenToSquare;
  faTrashCan = faTrashCan;
  faIdCard = faIdCard;
  faMagnifyingGlass = faMagnifyingGlass;
  faStar = faStar;
  faPlus = faPlus;

  ngOnInit(): void {
    setTimeout(() => {
      this.direction$.next(1);
      this.FilterPlayers('', '', '');
      this.http.get('http://localhost:3000/players/league_table').subscribe({
        next: (res) => {
          this.teams = res;
        }
      });
    }, 0);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.direction$.next(1);
      this.FilterPlayers('', '', '');
    }, 0);
  }

  KEYS: Record<string, Key> = {
    name: 'name',
    overall: 'overall',
    position: 'position',
    team: 'team',
    goals: 'goals',
    assist: 'assist',
    motm: 'motm',
    yellow_card: 'yellow_card',
    red_card: 'red_card',
  };

  private readonly size$ = new BehaviorSubject(10);
  private readonly page$ = new BehaviorSubject(0);

  readonly direction$ = new BehaviorSubject<-1 | 1>(-1);
  readonly sorter$ = new BehaviorSubject<Key>('name');

  readonly nameSearch = new FormControl();
  readonly positionSearch = new FormControl();
  readonly teamSearch = new FormControl();

  readonly name = new FormControl();
  readonly position = new FormControl();
  readonly team = new FormControl();

  request$ = combineLatest([
    this.sorter$,
    this.direction$,
    this.page$,
    this.size$,
  ]).pipe(
    // zero time debounce for a case when both key and direction change
    debounceTime(0),
    switchMap(query => this.getData(...query).pipe(startWith(null))),
    share(),
  );

  initial: readonly string[] = ['name', 'overall', 'position', 'team', 'goals', 'assist', 'motm', 'yellow_card', 'red_card'];

  enabled = this.initial;

  columns = ['name', 'overall', 'position', 'team', 'goals', 'assist', 'motm', 'yellow_card', 'red_card', 'actions'];

  search = '';

  readonly arrow = TUI_ARROW;

  readonly loading$ = this.request$.pipe(map(tuiIsFalsy));

  readonly total$ = this.request$.pipe(
    filter(tuiIsPresent),
    map(({ length }) => length),
    startWith(1),
  );

  data$: Observable<readonly Player[]> =
    this.request$.pipe(
      filter(tuiIsPresent),
      map(player => player.filter(tuiIsPresent)),
      startWith([]),
    );

  onEnabled(enabled: readonly string[]): void {
    this.enabled = enabled;
    this.columns = this.initial
      .filter(column => enabled.includes(column))
      .map(column => this.KEYS[column]);
  }

  onDirection(): void {
    this.direction$.next(this.direction$.value === 1 ? -1 : 1);
  }

  onSize(size: number): void {
    this.size$.next(size);
  }

  onPage(page: number): void {
    this.page$.next(page);
  }

  isMatch(value: unknown): boolean {
    return !!this.search && TUI_DEFAULT_MATCHER(value, this.search);
  }

  FilterPlayers(name: string, position: string, team: string) {
    var httpParams: HttpParams = new HttpParams();

    if (name != null) {
      httpParams = httpParams.append('name', name);
    }
    if (position != null) {
      httpParams = httpParams.append('position', position);
    }
    if (team != null) {
      httpParams = httpParams.append('team', team);
    }

    this.http.get('http://localhost:3000/players/players_list/filters', { params: httpParams }).subscribe({
      next: (res: any) => {
        this.players = res;
        this.dataService.setPlayersList(res);
        this.page$.next(0);
      }
    });
  }

  GetPlayers() {
    this.http.get('http://localhost:3000/players/players_list').subscribe({
      next: (res: any) => {
        this.dataService.setPlayersList(res);
        this.players = this.dataService.getPlayersList();
      },
      error: (err: any) => {
      },
      complete: () => {
        console.info('load complete');
      }
    });
  }

  getDropDown(type: string) {

    this.http.get(`http://localhost:3000/players/${type}`).subscribe({
      next: (res: any) => {
        if (type == 'roles') {
          this.itemsRoles = res.map((item: any) => item.position);
        } else if (type == 'teams') {
          this.itemsTeams = res.map((item: any) => item.team);
        }
      }
    })

  }

  selectedPlayer!: Player;
  selectedPlayerId: number | null = null;

  assignPlayer(player: any, dialog: any, header: any, size: any) {

    this.selectedPlayer = player;
    this.selectedPlayerId = player.id;

    this.onClick(dialog, header, size);

  };

  delete(observer: any, filteredValue: Array<any>) {

    this.http.delete(`http://localhost:3000/players/player-delete/${this.selectedPlayerId}`).subscribe({
      error: (err: any) => {
        console.error(err);
      },
      complete: () => {
        observer.complete();
        this.FilterPlayers(filteredValue[0], filteredValue[1], filteredValue[2]);
        this.alerts.open('Info Calciatore aggiornate con Successo!!', { label: 'Operazione Effettuata', status: TuiNotification.Success }).subscribe();

      }
    })
  }

  close(observer: any) {
    observer.complete();
  }

  onClick(
    content: PolymorpheusContent<TuiDialogContext>,
    header: PolymorpheusContent,
    size: TuiDialogSize,
  ): void {
    this.dialogs
      .open(content, {
        header,
        size: size,
        dismissible: false,
      })
      .subscribe();
  }

  currentSortColumn: string | number | symbol | null = null;

  onSortByChange(sortEvent: string | number | symbol | null): void {
    if (typeof sortEvent === 'string') {
      // Se la colonna corrente è diversa dalla precedente, imposta la direzione su 1
      if (this.currentSortColumn !== sortEvent) {
        this.currentSortColumn = sortEvent;
        this.direction$.next(1);
      }
      this.sorter$.next(sortEvent as Key);
    }
  }

  private getData(
    key: 'name' | 'overall' | 'position' | 'team' | 'goals' | 'assist' | 'motm' | 'yellow_card' | 'red_card',
    direction: -1 | 1,
    page: number,
    size: number,
  ): Observable<ReadonlyArray<Player | null>> {
    //console.info('Making a request', this.dataService.getPlayersList());
    let start = page * size;
    let end = start + size;
    let result = [...this.players]
      .sort(sortBy(key, direction))
      .map((player, index) => (index >= start && index < end ? player : null));

    // Imitating server response
    return timer(500).pipe(map(() => result));
  }


  teamLogo(array: any, teamName: string) {
    // Find the object where the team name matches the parameter
    const teamObj = array.find((obj: any) => obj.team === teamName);
    // If found, return the team_logo, otherwise return a message or null
    return teamObj ? teamObj.team_logo : '../../../../assets/media/Icons/img/pCC3lju.png';
  }
}


function sortBy(key: 'name' | 'overall' | 'position' | 'team' | 'goals' | 'assist' | 'motm' | 'yellow_card' | 'red_card', direction: -1 | 1): TuiComparator<Player> {
  return (a, b) =>
    direction * tuiDefaultSort(a[key], b[key]);

}
