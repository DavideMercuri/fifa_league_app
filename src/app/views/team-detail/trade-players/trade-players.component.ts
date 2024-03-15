import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { faCircleXmark, faPlus, faRightLong, faXmark } from '@fortawesome/free-solid-svg-icons';
import { TuiStringHandler, TuiContextWithImplicit, TuiIdentityMatcher } from '@taiga-ui/cdk';
import { TuiAlertService, TuiNotification, tuiNumberFormatProvider } from '@taiga-ui/core';
import { Observable, Subject } from 'rxjs';
import { Player } from 'src/interfaces/player.interface';
import { Team } from 'src/interfaces/team.interfaces';
import { TeamDetailComponent } from '../team-detail.component';
import { Transaction } from 'src/interfaces/transaction.interface';

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
  styleUrls: ['./trade-players.component.less'],
  providers: [tuiNumberFormatProvider({ thousandSeparator: '.' })],
})
export class TradePlayersComponent implements OnInit {

  constructor(private http: HttpClient, @Inject(TuiAlertService) private readonly alerts: TuiAlertService, private teamDetail: TeamDetailComponent) { }

  @Input() player: any;
  @Input() teamPlayers: any;
  @Input() playerId: any;
  @Input() observer: any;
  @Input() filteredValue: any;
  @Input() selectedTeam!: Team;

  multitrade: FormControl = new FormControl(false);
  selectTeam = new FormControl();
  multiTradeForm = new FormGroup({});
  singleTradeForm = new FormControl();
  transferValueInput = new FormControl();
  additionalPlayers: FormControl = new FormControl();
  additionalBuyerPlayers: FormControl = new FormControl();
  controlNames: Array<any> = [];
  comboBoxData: Observable<any>[] = [];
  selectedTeamPlayers: Player[] = [];

  playersBuyerTeam: Array<Player> = [];
  buyerTeamLogo: String = '';

  itemsRoles: Array<string> = [];
  itemsTeams: Array<string> = [];

  faPlus = faPlus;
  faXmark = faXmark;
  faRightLong = faRightLong;
  faCircleXmark = faCircleXmark;

  disableElement: boolean = true;

  ngOnInit(): void {

    this.filterPlayers(this.selectedTeam.team_name);
    this.getDropDown('teams');

    const controlName = `comboBox0`;
    this.controlNames.push(controlName);
    this.multiTradeForm.addControl(controlName, new FormControl(this.player));

    this.singleTradeForm.setValue(this.player);
    this.singleTradeForm.disable();

    this.selectTeam.setValue('Svincolati');

    this.transferValueInput.disable();
    this.transferValueInput.setValue(this.player.player_value / 2);

    this.additionalPlayers.disable();
    this.multitrade.disable();

  }

  checkBuyerTeam(team: any) {
    if (team == 'Svincolati') {
      this.transferValueInput.disable();
      this.transferValueInput.setValue(this.player.player_value / 2);
      this.additionalPlayers.reset();
      this.additionalBuyerPlayers.reset();
      this.multitrade.setValue(false);
      this.multitrade.disable();
      this.disableElement = true;
    } else {
      this.transferValueInput.enable();
      this.transferValueInput.setValue(this.player.player_value);
      this.additionalPlayers.enable();
      this.additionalBuyerPlayers.reset();
      this.multitrade.enable();
      this.disableElement = false;
    }
  }

  getDropDown(type: string) {

    this.http.get(`http://localhost:3000/players/${type}`).subscribe({
      next: (res: any) => {
        if (type == 'roles') {
          this.itemsRoles = res.map((item: any) => item.position);
        } else if (type == 'teams') {
          this.itemsTeams = res.map((item: any) => item.team);
          this.itemsTeams = this.itemsTeams.filter(item => item != this.selectedTeam.team_name);
          this.itemsTeams.push('Svincolati');
          this.itemsTeams = [...new Set(this.itemsTeams)];
        }
      }
    })

  }

  setTradeValueToZero() {

    this.transferValueInput.setValue(0);

  }

  filterPlayers(team: string, tradeFlag?: boolean) {

    var httpParams: HttpParams = new HttpParams();

    httpParams = httpParams.append('team', team);

    this.http.get<Player[]>('http://localhost:3000/players/players_list/filters', { params: httpParams }).subscribe({
      next: (res: Player[]) => {
        if (tradeFlag) {
          this.playersBuyerTeam = res;
        } else {
          this.selectedTeamPlayers = res;
          this.selectedTeamPlayers = this.selectedTeamPlayers.filter(item => item.id != this.player.id);
        }
      }
    });
  }

  confirmTransfer() {

    const transferData = {
      sellingTeam: this.selectedTeam.team_name,
      buyingTeam: this.selectTeam.value,
      transferAmount: this.transferValueInput.value,
      mainPlayer: this.player,
      additionalPlayers: this.additionalPlayers.value,
      additionalBuyerPlayers: this.additionalBuyerPlayers.value,
    };
    
    let sold_players: Array<string> = [];
    let purchased_players: Array<string> = [];

    sold_players.push(this.player.name);

    if (this.additionalPlayers.value) {

      this.additionalPlayers.value.forEach((element: any) => {
        sold_players.push(element.name)
      });
    }

    if (this.additionalBuyerPlayers.value) {
      this.additionalBuyerPlayers.value.forEach((element: any) => {
        purchased_players.push(element.name)
      });
    }

    const transactionSeller: Transaction = {
      transaction_mode: 'CREDIT',
      transaction_amount: this.transferValueInput.value,
      transaction_date: new Date().toString(),
      transaction_team: this.selectedTeam.team_name,
      transaction_detail: {
        type: 'players_transfer',
        sold_players: sold_players,
        purchased_players: purchased_players
      },
      updated_team_money: this.selectedTeam.money + this.transferValueInput.value
    }

    const transactionBuyer: Transaction = {
      transaction_mode: 'DEBIT',
      transaction_amount: this.transferValueInput.value,
      transaction_date: new Date().toString(),
      transaction_team: this.selectTeam.value,
      transaction_detail: {
        type: 'players_transfer',
        sold_players: purchased_players,
        purchased_players: sold_players
      },
      updated_team_money: this.selectedTeam.money - this.transferValueInput.value
    }

    this.http.post('http://localhost:3000/transfer', transferData).subscribe({
      error: (error) => {
        console.error('Transfer failed', error);
      },
      complete: () => {
        this.registerTransaction(this.selectedTeam.team_name, transactionSeller);
        this.registerTransaction(this.selectTeam.value, transactionBuyer);
        this.updateTeamSalaryAndValue();
        this.observer.complete();
        this.teamDetail.loadDataBasedOnId(this.selectedTeam.team_id);
        this.teamDetail.FilterPlayers('', '', this.selectedTeam.team_name);
        this.alerts.open('Trasferimento effettuato con Successo!!', { label: 'Operazione Effettuata', status: TuiNotification.Success }).subscribe();
      }
    });
  }

  registerTransaction(transaction_team: string, transaction: Transaction): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post('http://localhost:3000/players/register-transaction', { teamName: transaction_team, transaction })
        .subscribe({
          next: (response) => {
            console.log('Transaction registered successfully', response);
            resolve(response);
          },
          error: (error) => {
            console.error('Error registering transaction', error);
            reject(error);
          }
        });
    });
  }

  updateTeamSalaryAndValue() {

    this.http.put(`http://localhost:3000/players/team-detail/update-value-salary`, undefined).subscribe({
      error: (err: any) => {
        console.error(err);
      },
    });

  }

  loadDataBasedOnTeamName(team_name: any): void {

    var httpParams: HttpParams = new HttpParams().append('team_name', team_name);
    this.http.get(`http://localhost:3000/players/team-detail`, { params: httpParams }).subscribe({
      next: (res: any) => {
        if (team_name == 'Svincolati') {
          this.buyerTeamLogo = 'https://i.imgur.com/pCC3lju.png'
        } else {
          this.buyerTeamLogo = res[0].team_logo;
        }
      }
    });
  }

  readonly stringify: TuiStringHandler<PlayerSearch | TuiContextWithImplicit<PlayerSearch>> = item => {
    if (item && typeof item === 'object' && 'name' in item) {
      return item.name;
    }
    return '';
  };

  readonly identityMatcher: TuiIdentityMatcher<PlayerSearch> = (player1, player2) =>
    player1.id === player2.id;


  readonly search$ = new Subject<string | null>();

  onSearchChange(searchQuery: string | null): void {

    this.search$.next(searchQuery);

  }

  extractValueFromEvent(event: Event): string | null {
    return (event.target as HTMLInputElement)?.value || null;
  }

}
