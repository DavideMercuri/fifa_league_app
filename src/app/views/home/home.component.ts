import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DataService } from 'src/app/data.service';
import { FormControl } from '@angular/forms';
import { Fixture } from 'src/interfaces/fixture.interfaces';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {

  constructor(private http: HttpClient, private dataService: DataService, private cd: ChangeDetectorRef) { }

  items!: Array<any>;

  activeTeams: Array<string> = [];
  homeWins: Array<number> = [];
  awayWins: Array<number> = [];
  homeDraws: Array<number> = [];
  awayDraws: Array<number> = [];
  homeLosses: Array<number> = [];
  awayLosses: Array<number> = [];
  topPlayersList: any = [];
  lastMatch!: Fixture;
  transactions: any;

  tdStyleClass: string = 'tui-table__td tui-table__td_text_center team tui-table__td_first tui-table__td_last';
  trStyleClass: string = 'tui-table__tr tui-table__tr_border_none tui-table__tr_hover_disabled';
  tableStyleClass: string = 'tui-table tui-table__tr_hover_disabled tui-table_font-size_s';
  fixturesButtonStyleClass: string = 'action tui-table col-4 button-fixture';

  index = 0;
  indexStats = 0;
  indexTransactions = 0;

  leagueNumber: FormControl = new FormControl();
  year: FormControl = new FormControl();

  teams: any;

  readonly columns = ['tipo', 'importo', 'data', 'causale', 'saldo'];

  faMagnifyingGlass = faMagnifyingGlass;

  @ViewChild('carousel') carousel: any;

  ngOnInit(): void {

    this.http.get('http://localhost:3000/players/league_table').subscribe({
      next: (res) => {
        this.teams = res;
      }
    });

    setTimeout(() => {
      this.getLastAvalaibleMatch();
      this.getTopPlayersInfo('goals');
      this.getTopPlayersInfo('assist');
      this.getTopPlayersInfo('motm');
      this.GetPlayers();
      this.getTransactions();
    }, 0);
  }

  getTopPlayersInfo(category: string): void {
    this.http.get(`http://localhost:3000/players/players_list/top_players?category=${category}`).subscribe({
      next: (res: any) => {

        switch (category) {
          case 'goals':
            this.topPlayersList.push({ ...res[0], ...{ label: 'Miglior Marcatore', subLabel: `Goal in Campionato`, stat: res[0].goals } });
            break;
          case 'assist':
            this.topPlayersList.push({ ...res[0], ...{ label: 'Miglior Assistman', subLabel: `Assist in Campionato`, stat: res[0].assist } });
            break;
          case 'motm':
            this.topPlayersList.push({ ...res[0], ...{ label: 'Miglior Motm', subLabel: `volte Migliore in Campo`, stat: res[0].motm } });
            break;
        }
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  getTransactions() {
    this.http.get(`http://localhost:3000/players/transactions`).subscribe({
      next: (res: any) => {

        this.transactions = this.convertJsonStrings(res);

      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  convertJsonStrings(array: any[]): any[] {
    let transactions: any[] = [];

    array.forEach((item, index) => {
      if (item && item.team_transactions && item.team_name) {
        try {
          console.log(`Processing item at index ${index}`);
          const parsedJsonArray = JSON.parse(item.team_transactions);
          if (Array.isArray(parsedJsonArray)) {
            // Prendi solo gli ultimi 5 risultati (o meno)
            const lastFiveTransactions = parsedJsonArray.slice(-6);
            transactions.push({
              team_name: item.team_name,
              transactions: lastFiveTransactions
            });
          } else {
            console.warn(`Parsed JSON is not an array at index ${index}`);
            transactions.push({
              team_name: item.team_name,
              transactions: []
            });
          }
        } catch (e) {
          console.error('Error parsing JSON at index', index, ':', e);
          transactions.push({
            team_name: item.team_name,
            transactions: []
          });
        }
      } else {
        console.warn(`Invalid item at index ${index}`, item);
        transactions.push({
          team_name: item.team_name || 'Unknown Team',
          transactions: []
        });
      }
    });

    return transactions;
  }

  GetPlayers() {
    this.http.get('http://localhost:3000/players/players_list').subscribe({
      next: (res: any) => {
        this.dataService.setPlayersList(res);
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  SetMaxValue(homeStat: any, awayStat: any): number {

    var maxValue = Math.max(...this.activeTeams.map((activeTeams, index) => homeStat[index] + awayStat[index]));

    return maxValue;

  }

  getLastAvalaibleMatch() {

    this.http.get(`http://localhost:3000/players/fixtures/get-last-avalaible-match`).subscribe({
      next: (res: any) => {
        this.lastMatch = res[0];
      }
    })
  }

  teamLogo(array: any, teamName: string) {
    if (array) {
      const teamObj = array.find((obj: any) => obj.team === teamName);
      return teamObj ? teamObj.team_logo : 'No logo found for this team';
    } else {
      setTimeout(() => {
        this.teamLogo(array, teamName);
      }, 100)
    }

  }

}