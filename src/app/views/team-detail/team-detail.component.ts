import { HttpClient, HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { faUser, faFutbol, faMedal, faPersonRunning, faShieldHalved, faPenToSquare, faTrashCan, faIdCard, faMagnifyingGlass, faStar, faSackDollar, faCommentDollar } from '@fortawesome/free-solid-svg-icons';
import { TuiComparator } from '@taiga-ui/addon-table';
import { tuiIsFalsy, tuiIsPresent, TUI_DEFAULT_MATCHER, tuiDefaultSort } from '@taiga-ui/cdk';
import { TuiDialogService } from '@taiga-ui/core';
import { TUI_ARROW } from '@taiga-ui/kit';
import { BehaviorSubject, Observable, Subscription, combineLatest, debounceTime, filter, map, share, startWith, switchMap, timer } from 'rxjs';
import { DataService } from 'src/app/data.service';
import { Player } from 'src/interfaces/player.interface';
import { Team } from 'src/interfaces/team.interfaces';

type Key = 'name' | 'overall' | 'position' | 'salary' | 'player_value';

@Component({
  selector: 'app-team-detail',
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.less']
})
export class TeamDetailComponent implements OnInit, AfterViewInit {

  teamId: string = '';
  team!: Team;
  players: Array<Player> = [];

  faUser = faUser;
  faPenToSquare = faPenToSquare;
  faTrashCan = faTrashCan;
  faIdCard = faIdCard;
  faStar = faStar;
  faSackDollar = faSackDollar;
  faCommentDollar = faCommentDollar;

  constructor(private route: ActivatedRoute, private dataService: DataService, private http: HttpClient, @Inject(TuiDialogService) private readonly dialogs: TuiDialogService) { }
  ngAfterViewInit(): void {

      this.loadDataBasedOnId(this.teamId);
      this.FilterPlayers('', '', this.team.team_name);

  }

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      this.teamId = String(params.get('id'));
      this.loadDataBasedOnId(this.teamId);
      setTimeout(() => {
        this.FilterPlayers('', '', this.team.team_name);
      },100)


    });
  }

  loadDataBasedOnId(id: string): void {

    var httpParams: HttpParams = new HttpParams().append('id', id);

    this.http.get(`http://localhost:3000/players/team-detail`, { params: httpParams }).subscribe({
      next: (res: any) => {
        this.team = res[0];
      }
    });

  }


  KEYS: Record<string, Key> = {
    name: 'name',
    overall: 'overall',
    position: 'position',
    salary: 'salary',
    value: 'salary'
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

  initial: readonly string[] = ['name', 'overall', 'position', 'salary', 'player_value'];

  enabled = this.initial;

  columns = ['name', 'overall', 'position', 'salary', 'player_value', 'actions'];

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
        console.log(res);

        this.players = res;
        this.dataService.setPlayersList(res);
        this.page$.next(0);
      }
    });

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
    key: 'name' | 'overall' | 'position' | 'salary' | 'player_value',
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
    return timer(3000).pipe(map(() => result));
  }

  getTeamColor(teamname: string): any {
    switch (teamname) {
      case "Werder Brema":
        return '#179152'
      case "Manchester City":
        return '#96c1e7';
      case "Borussia Dortmund":
        return '#fcd917';
      default:
        return '';
    }
  }

    getTeamText(teamname: string): any {
    switch (teamname) {
      case "Werder Brema":
        return '#fff'
      case "Manchester City":
        return '#fff';
      case "Borussia Dortmund":
        return '#000';
      default:
        return '';
    }
  }

}

function sortBy(key: 'name' | 'overall' | 'position' | 'salary' | 'player_value', direction: -1 | 1): TuiComparator<Player> {
  return (a: any, b: any) =>
    direction * tuiDefaultSort(a[key], b[key]);
}
