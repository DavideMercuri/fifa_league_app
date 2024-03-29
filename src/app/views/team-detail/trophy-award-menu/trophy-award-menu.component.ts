import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { faShieldHalved, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { UCLInfo, leagueInfo } from 'src/app/components/navbar/common-data';
import { Team } from 'src/interfaces/team.interfaces';
import { TeamDetailComponent } from '../team-detail.component';
import { TuiAlertService, TuiNotification } from '@taiga-ui/core';
import { TUI_DEFAULT_MATCHER, TuiContextWithImplicit, TuiIdentityMatcher, TuiStringHandler } from '@taiga-ui/cdk';
import { Player } from 'src/interfaces/player.interface';
import { Observable, Subject, delay, filter, of, startWith, switchMap } from 'rxjs';
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
  selector: 'app-trophy-award-menu',
  templateUrl: './trophy-award-menu.component.html',
  styleUrls: ['./trophy-award-menu.component.less']
})

export class TrophyAwardMenuComponent implements OnInit {

  constructor(private http: HttpClient, private teamDetail: TeamDetailComponent, @Inject(TuiAlertService)
  private readonly alerts: TuiAlertService) { }

  @Input() selectedTeam!: Team;
  @Input() observer: any;

  selectedTeamPlayers: Player[] = [];
  tempMoney: any;

  leagueInfo = leagueInfo;
  UCLInfo = UCLInfo;

  placeholder: any = `Pallone D'oro`

  faShieldHalved = faShieldHalved;
  faTrophy = faTrophy;

  awardForm = new FormGroup({
    awardCampionato: new FormControl(),
    awardChampionsLeague: new FormControl(),
    awardCup: new FormControl(false),
    awardBestScorer: new FormControl(false),
    awardBestAssistman: new FormControl(false),
    awardBestMotm: new FormControl(false),
    awardBestScorerUcl: new FormControl(false),
    awardGoldenBall: new FormControl(false),
  });

  pots: FormControl = new FormControl();

  ngOnInit(): void {
    this.tempMoney = this.selectedTeam.money;
    this.filterPlayers(this.selectedTeam.team_name);
    this.pots.disable();
  }

  setCheckboxStatus() {
    if (this.awardForm.controls['awardGoldenBall'].value == false) {
      this.pots.reset();
      this.pots.disable();
    } else {
      this.pots.enable();
    }
  }

  onSearchChange(searchQuery: string | null): void {

    this.search$.next(searchQuery);

  }

  extractValueFromEvent(event: Event): string | null {
    return (event.target as HTMLInputElement)?.value || null;
  }

  readonly stringify: TuiStringHandler<PlayerSearch | TuiContextWithImplicit<PlayerSearch>> = item =>
    'name' in item ? item.name : item.$implicit.name;

  readonly search$ = new Subject<string | null>();


  readonly items$: Observable<readonly PlayerSearch[] | null> = this.search$.pipe(
    filter(value => value !== null),
    switchMap(search =>
      this.serverRequest(search).pipe(startWith<readonly PlayerSearch[] | null>(null)),
    ),
    startWith(this.selectedTeamPlayers),
  );

  private serverRequest(searchQuery: string | null): Observable<readonly PlayerSearch[]> {
    const result = this.selectedTeamPlayers.filter(user =>
      TUI_DEFAULT_MATCHER(user.name, searchQuery || ''),
    );

    return of(result).pipe(delay(200));
  }

  readonly identityMatcher: TuiIdentityMatcher<PlayerSearch> = (player1, player2) =>
    player1.id === player2.id;

  async save() {

    let totalSum = 0;

    const checkboxValues: any = {
      awardCup: 10000000,
      awardBestScorer: 15000000,
      awardBestAssistman: 10000000,
      awardBestMotm: 5000000,
      awardBestScorerUcl: 10000000,
      awardGoldenBall: 5000000,
    };

    const keys = Object.keys(this.awardForm.controls);
    for (const key of keys) {
      const control = this.awardForm.get(key);

      if (control && control.value) {

        var prizeType: string = '';
        var prizeValue: number;

        switch (key) {
          case 'awardCampionato':
            prizeType = `${control.value.label} Campionato`
            prizeValue = control.value.awardValue;
            break;
          case 'awardChampionsLeague':
            prizeType = `${control.value.label} UCL`
            prizeValue = control.value.awardValue;
            break;
          case 'awardCup':
            prizeType = `Vittoria Coppa`
            prizeValue = 10000000;
            break;
          case 'awardBestScorer':
            prizeType = `Premio Marcatore`
            prizeValue = 15000000;
            break;
          case 'awardBestAssistman':
            prizeType = `Premio Assist`
            prizeValue = 10000000;
            break;
          case 'awardBestMotm':
            prizeType = `Premio MOTM`
            prizeValue = 5000000;
            break;
          case 'awardBestScorerUcl':
            prizeType = `Premio Marcatore UCL`
            prizeValue = 10000000;
            break;
          case 'awardGoldenBall':
            prizeType = `Premio Pallone D'oro`
            prizeValue = 5000000;
            break;
          default:
            prizeType = ''
            prizeValue = 0;
            break;
        }

        this.tempMoney = this.tempMoney + prizeValue;

        var transaction: Transaction =
        {
          transaction_mode: 'CREDIT',
          transaction_amount: prizeValue,
          transaction_date: new Date().toString(),
          transaction_team: String(this.selectedTeam.team_name),
          transaction_detail: {
            type: 'prize',
            prize: prizeType
          },
          updated_team_money: this.tempMoney
        }

        await this.registerTransaction(this.selectedTeam.team_name, transaction);

        if (typeof control.value === 'object' && control.value.hasOwnProperty('awardValue')) {
          totalSum += control.value.awardValue;
        } else if (typeof control.value === 'boolean' && control.value === true) {
          totalSum += checkboxValues[key];
        }
      }
    };

    var leagueWin: boolean = false;
    var uclWin: boolean = false;

    if (this.awardForm.controls['awardCampionato'].value && this.awardForm.controls['awardCampionato'].value.label == '1° Posto') {
      leagueWin = true;
    }
    if (this.awardForm.controls['awardChampionsLeague'].value && this.awardForm.controls['awardChampionsLeague'].value.label == 'Vittoria') {
      uclWin = true;
    }

    this.updateMoney(Number(this.selectedTeam.team_id), totalSum, leagueWin, uclWin);

    if (this.awardForm.controls['awardGoldenBall'].value == true) {
      this.setBaloonDor(this.pots.value);
    }

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

  updateMoney(id: number, sum: number, leagueWin?: boolean, uclWin?: boolean) {

    const body = { id, sum };
    this.http.put('http://localhost:3000/players/team_detail/update-team-money', body).subscribe({
      complete: () => {
        if (leagueWin) {
          this.updateTeamTrophy(id, 'league_win');
        }
        if (uclWin) {
          this.updateTeamTrophy(id, 'cup_win');
        }
        this.observer.complete();
        this.teamDetail.loadDataBasedOnId(String(id));
        this.alerts.open('Modifica Avvenuta con Successo!!', { label: 'Operazione Effettuata', status: TuiNotification.Success }).subscribe();
      }
    });
  }

  updateTeamTrophy(id: number, trophyType: string) {

    const body = { id, trophyType };
    this.http.put('http://localhost:3000/players/team_detail/update-team-trophy', body).subscribe({});
  }

  resetBaloonDor() {

    this.http.put('http://localhost:3000/players/team_detail/reset-baloon-dor', undefined).subscribe({});

  }

  setBaloonDor(player: any) {

    this.resetBaloonDor();
    this.http.put('http://localhost:3000/players/team_detail/set-baloon-dor', { id: player.id }).subscribe({

    });

  }

  filterPlayers(team: string) {

    var httpParams: HttpParams = new HttpParams();

    httpParams = httpParams.append('team', team);

    this.http.get<Player[]>('http://localhost:3000/players/players_list/filters', { params: httpParams }).subscribe({
      next: (res: Player[]) => {

        this.selectedTeamPlayers = res;

      }
    });
  }

}