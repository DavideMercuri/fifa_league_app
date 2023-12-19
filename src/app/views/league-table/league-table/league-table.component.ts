import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { faFolderPlus } from '@fortawesome/free-solid-svg-icons';
import { DataService } from 'src/app/data.service';

@Component({
  selector: 'app-league-table',
  templateUrl: './league-table.component.html',
  styleUrls: ['./league-table.component.less']
})
export class LeagueTableComponent implements OnInit {

  constructor(private http: HttpClient) { }

  faFolderPlus = faFolderPlus;

  ngOnInit(): void {
    this.GetLeagueTable();
  }

  leagueTable: any = [];

  columns = ['position', 'team', 'games_played', 'wins', 'draws', 'losses', 'goal_difference', 'points'];

  GetLeagueTable() {
    this.http.get('http://localhost:3000/players/league_table').subscribe({
      next: (res) => {
        this.leagueTable = res;
      }
    });
  }

  goalDifferenceStyle(gd: any): string {

    if (gd > 0) {
      return 'positive-gd-status';
    } else if (gd == 0) {
      return 'neutral-gd-status';
    } else if (gd < 0) {
      return 'negative-gd-status';
    }else{
      return '';
    }

  }

  startNewSeason(data: Array<any>){
    this.http.put('http://localhost:3000/reset-league', undefined).subscribe({
      error: (err: any) => {
      },
      complete: () => {
        console.log('Reset Completato');
      }
    })
  }

}
