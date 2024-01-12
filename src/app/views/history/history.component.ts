import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { faRectangleList, faUsersRectangle } from '@fortawesome/free-solid-svg-icons';
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
  
  faRectangleList: any = faRectangleList;
  faUsersRectangle: any = faUsersRectangle;

  ngOnInit(): void {
    this.getHistory();
  }

  ngAfterViewInit(): void {

  }

  getHistory() {
    this.http.get('http://localhost:3000/players/history').subscribe({
      next: (res: any) => {
        this.getSummary(res);
      },
      complete: () => {
      }
    })
  }

  getSummary(res: any) {
    let copyOfRes = [...res];
    copyOfRes.pop();

    let seasonsSummaryTemp = copyOfRes.map(season => {

      let leagueTableArray = JSON.parse(season.season_league_table);
      let leagueTeams = JSON.parse(season.season_teams);

      let winnerTeam = leagueTableArray.reduce((prev: any, current: any) => {
        return (prev.points > current.points) ? prev : current;
      });

      let winnerTeamUCL = leagueTeams.reduce((acc: any, element: any) => {
        // Se l'elemento corrente ha il campo season_champions_league_winner impostato su 'yes', lo restituisce
        if (element.season_champions_league_winner === 'yes') {
          return element;
        }
        return acc; // Altrimenti, continua con l'elemento accumulato
      }, null); // Inizializza l'accumulatore a null


      return {
        season_id: season.season_id,
        season_year: season.season_year,
        season_fixtures: JSON.parse(season.season_fixtures),
        season_league_table: JSON.parse(season.season_league_table),
        winnerTeam: winnerTeam,
        winnerTeamUCL: winnerTeamUCL
      };
    });

    this.seasonsSummary = seasonsSummaryTemp.sort((a, b) => a.season_id - b.season_id);
  }

  convertImgToBase64(img: { data: number[] }): string {
    const byteCharacters = String.fromCharCode(...img.data);
    const base64String = btoa(byteCharacters);
    return `data:image/png;base64,${base64String}`;
  }

  openDialog(content: PolymorpheusContent<TuiDialogContext>, header: PolymorpheusContent, size: TuiDialogSize): void {
    this.dialogs.open(content, {
      size: size,
      dismissible: false,
    }).subscribe();
  }

}
