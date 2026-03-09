import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { faCalendarDays, faMoneyCheckDollar, faRankingStar, faUsersRectangle } from '@fortawesome/free-solid-svg-icons';
import { TuiDialogContext, TuiDialogService, TuiDialogSize } from '@taiga-ui/core';
import { PolymorpheusContent } from '@tinkoff/ng-polymorpheus';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.less']
})
export class HistoryComponent implements OnInit, AfterViewInit {

  constructor(private http: HttpClient, @Inject(TuiDialogService) private readonly dialogs: TuiDialogService) { }

  testForm = new FormGroup({
    name: new FormControl(''),
    accounts: new FormControl(),
  });

  seasonsSummary: Array<any> = [];

  faCalendarDays: any = faCalendarDays;
  faUsersRectangle: any = faUsersRectangle;
  faRankingStar: any = faRankingStar;
  faMoneyCheckDollar = faMoneyCheckDollar;
  isLoading: boolean = true;

  dropdownIndex: number | null = null;

  // Proprietà di paginazione
  currentPage = 1;
  pageSize = 10; // Numero di elementi per pagina
  totalItems = 0;

  ngOnInit(): void {
    this.getHistory();
  }

  ngAfterViewInit(): void {

  }

  getHistory() {
    this.isLoading = true;

    this.http.get('http://localhost:3000/players/history').subscribe({
      next: (res: any) => {
        this.totalItems = Math.ceil(res.length / this.pageSize); // number of pages

        const start = (this.currentPage - 1) * this.pageSize;
        const end = this.currentPage * this.pageSize;
        this.getSummary(res.slice(start, end)); // slice mantiene l'ordine del server (DESC)
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  getSummary(res: any) {
    let copyOfRes = [...res];

    let seasonsSummaryTemp = copyOfRes.map(season => {

      let leagueTableArray = JSON.parse(season.season_league_table);

      let winnerTeam = leagueTableArray.reduce((prev: any, current: any) => {
        return (prev.points > current.points) ? prev : current;
      });

      return {
        season_id: season.season_id,
        season_year: season.season_year,
        season_fixtures: JSON.parse(season.season_fixtures),
        season_league_table: JSON.parse(season.season_league_table),
        season_teams: JSON.parse(season.season_teams),
        winnerTeam: winnerTeam,
        winnerTeamUCL: season.winnerTeamUCL,
        season_top_scorers: JSON.parse(season.season_top_scorers),
        season_top_assist: JSON.parse(season.season_top_assist),
        season_top_motm: JSON.parse(season.season_top_motm),
        season_ballon_dOr: JSON.parse(season.season_ballon_dOr),
      };
    });

    // non riordinare in crescente, tieni l'ordine del server (già DESC)
    this.seasonsSummary = seasonsSummaryTemp;
  }

  openDialog(content: PolymorpheusContent<TuiDialogContext>, header: PolymorpheusContent, size: TuiDialogSize): void {
    this.dialogs.open(content, {
      size: size,
      dismissible: false,
    }).subscribe();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getHistory(); // Oppure un'altra funzione per ottenere solo i dati per la pagina corrente
  }

}
