import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { TuiStringHandler, TuiContextWithImplicit, TUI_DEFAULT_MATCHER } from '@taiga-ui/cdk';
import { TuiAlertService, TuiDialogService, TuiSizeS } from '@taiga-ui/core';
import { Observable, Subject, delay, filter, of, startWith, switchMap } from 'rxjs';
import { DataService } from 'src/app/data.service';
import { Player } from 'src/interfaces/player.interface';
import { Team } from 'src/interfaces/team.interfaces';

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
  selector: 'app-trade-players',
  templateUrl: './trade-players.component.html',
  styleUrls: ['./trade-players.component.less']
})
export class TradePlayersComponent implements OnInit {

  constructor(private http: HttpClient, private dataService: DataService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    @Inject(TuiAlertService) private readonly alerts: TuiAlertService) { }

  @Input() player: any;
  @Input() playerId: any;
  @Input() observer: any;
  @Input() filteredValue: any;
  @Input() selectedTeam!: Team;

  multitrade: FormControl = new FormControl(false);
  multiTradeForm = new FormGroup({});
  controlNames: Array<any> = [];
  comboBoxData: Observable<any>[] = [];
  players: Array<Player> = [];

  faPlus = faPlus;

  ngOnInit(): void {
    this.FilterPlayers('', '', this.selectedTeam.team_name);
  }

  addControl() {

    const controlName = `comboBox${this.controlNames.length}`;

    console.log(controlName);
    this.controlNames.push(controlName);
    this.multiTradeForm.addControl(controlName, new FormControl(''));
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
      }
    });
  }

  readonly stringify: TuiStringHandler<PlayerSearch | TuiContextWithImplicit<PlayerSearch>> = item => {
    if (item && typeof item === 'object' && 'name' in item) {
      return item.name;
    }
    return ''; // Oppure un messaggio predefinito
  };


  readonly search$ = new Subject<string | null>();

  readonly items$: Observable<readonly PlayerSearch[] | null> = this.search$.pipe(
    filter(value => value !== null),
    switchMap(search =>
      this.serverRequest(search).pipe(startWith<readonly PlayerSearch[] | null>(null)),
    ),
    startWith(this.players),
  );

  private serverRequest(searchQuery: string | null): Observable<readonly PlayerSearch[]> {
    const result = this.players.filter(user =>
      TUI_DEFAULT_MATCHER(user.name, searchQuery || ''),
    );

    return of(result).pipe(delay(200));
  }

  onSearchChange(searchQuery: string | null): void {

    this.search$.next(searchQuery);

  }

  extractValueFromEvent(event: Event): string | null {
    return (event.target as HTMLInputElement)?.value || null;
  }

}
