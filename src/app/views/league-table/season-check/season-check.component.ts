import { LeagueTableComponent } from './../league-table.component';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { TuiDialogContext, TuiDialogService, TuiDialogSize, tuiNumberFormatProvider } from '@taiga-ui/core';
import { Fixture } from 'src/interfaces/fixture.interfaces';
import { Team } from 'src/interfaces/team.interfaces';
import { PolymorpheusContent } from '@tinkoff/ng-polymorpheus';

@Component({
  selector: 'app-season-check',
  templateUrl: './season-check.component.html',
  styleUrls: ['./season-check.component.less'],
  providers: [tuiNumberFormatProvider({ thousandSeparator: '.' })],
})
export class SeasonCheckComponent implements OnInit {
  load: boolean = false;;

  constructor(private cdRef: ChangeDetectorRef, private http: HttpClient, @Inject(TuiDialogService) private readonly dialogs: TuiDialogService, private leagueTable: LeagueTableComponent) { }

  @Input() observer: any;
  index = 0;
  indexStats = 0;

  fixtures: Array<Fixture> = [];
  totalCount: number = 0;
  playedCount: number = 0;

  leagueTeams: Array<Team> = [];
  leagueWinner: any;
  uclWinner: any;
  ballonDor: any;
  topScorer: any;
  topAssist: any;
  topMotm: any;
  salariesCheck: boolean = false;
  season_league_winner: any = {};

  @ViewChild('confirmModal') confirmModal: any;

  ngOnInit(): void {

    this.getCurrentSeasonInfo();
    this.checkPlayedFixtures();
    this.checkSalaries();

  }

  checkPlayedFixtures() {
    this.http.get('http://localhost:3000/players/fixtures').subscribe({
      next: (res: any) => {
        this.fixtures = res;
        this.totalCount = res.length;
        this.playedCount = this.fixtures.filter(fixture => fixture.played === 'yes').length;
      },
      complete: () => {
      }
    });
  }

  checkSalaries() {
    this.http.get('http://localhost:3000/players/all-teams').subscribe({
      next: (res: any) => {

        this.leagueTeams = res;
        this.salariesCheck = this.leagueTeams.every((team: Team) => {
          return team.paid_salaries === 'yes';
        });

        this.checkStepStatus(this.salariesCheck);
      },
    });
  }

  checkStepStatus(salaries_status: boolean) {

    if (this.playedCount == this.totalCount) {
      this.indexStats = 1;

      if (salaries_status) {
        this.indexStats = 2;
      } else {
        this.indexStats = 1;
      }
    } else {
      this.indexStats = 0;
    }

  }

  checkMoveToStepStatus(index: any): boolean {
    if (index == 0 && this.playedCount != this.totalCount) {
      return true;
    } else if (index == 1 && !this.salariesCheck) {
      return true;
    } else {
      return false;
    }
  }

  getCurrentSeasonInfo() {
    this.http.get('http://localhost:3000/players/get-current-season-info-review').subscribe({
      next: (res: any) => {
        this.leagueWinner = JSON.parse(res.season_league_winner)[0];
        this.uclWinner = !JSON.parse(res.season_ucl_winner)[0] ? null : JSON.parse(res.season_ucl_winner)[0];
        this.ballonDor = JSON.parse(res.season_ballon_dOr)[0];
        this.topScorer = JSON.parse(res.season_top_scorers)[0];
        this.topAssist = JSON.parse(res.season_top_assist)[0];
        this.topMotm = JSON.parse(res.season_top_motm)[0];
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }

  formatPlayerName(player: string): string {
    // Estrai il punteggio, se presente
    const scoreMatch = player.match(/\sx\d+$/);
    const score = scoreMatch ? scoreMatch[0] : '';
    const nameWithoutScore = player.replace(score, '').trim();

    // Dividi il nome in parti
    const nameParts = nameWithoutScore.split(' ');
    let formattedName = '';

    if (nameParts.length > 1) {
      // Se ci sono più parole, usa la prima lettera della prima parola e l'ultima parola per il cognome
      formattedName = `${nameParts[0][0]}. ${nameParts[nameParts.length - 1]}`;
    } else {
      // Se c'è una sola parola, usa quella come cognome
      formattedName = nameParts[0];
    }
    // Aggiungi il punteggio, se presente
    return formattedName + (score ? ' ' + score.trim() : '');
  }

  resetLeague(confirmObserver: any) {
    this.http.put('http://localhost:3000/reset-league', undefined).subscribe({
      error: (err: any) => {
        console.error(err);
      },
      complete: () => {
        console.log('Reset Completato');
        this.observer.complete();
        confirmObserver.complete();
        this.leagueTable.GetLeagueTable();
        this.load = false;
      }
    });
  }

  startNewLeague(confirmObserver: any) {
    this.load = true;
    this.http.post('http://localhost:3000/start-new-season', undefined).subscribe({
      error: (err: any) => {
        console.error(err);
      },
      complete: () => {
        this.resetLeague(confirmObserver);
      }
    });
  }

  openConfirmModal(content: PolymorpheusContent<TuiDialogContext>, header: PolymorpheusContent, size: TuiDialogSize): void {
    this.dialogs.open(content, {
      size: size,
      dismissible: false,
    }).subscribe();
  }
}
