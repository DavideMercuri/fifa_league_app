import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/data.service';

@Component({
  selector: 'app-league-table',
  templateUrl: './league-table.component.html',
  styleUrls: ['./league-table.component.less']
})
export class LeagueTableComponent implements OnInit {

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.GetLeagueTable();
  }

  leagueTable: any = [];

  columns = ['position', 'team', 'games_played', 'wins', 'draws', 'losses', 'points'];

  GetLeagueTable() {
    this.http.get('http://localhost:3000/players/league_table').subscribe({
      next: (res) => {
        this.leagueTable = res;        
      }
    });
  }

}
