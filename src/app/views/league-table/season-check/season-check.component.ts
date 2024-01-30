import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { tuiNumberFormatProvider } from '@taiga-ui/core';
import { Fixture } from 'src/interfaces/fixture.interfaces';
import { Team } from 'src/interfaces/team.interfaces';

@Component({
  selector: 'app-season-check',
  templateUrl: './season-check.component.html',
  styleUrls: ['./season-check.component.less'],
  providers: [tuiNumberFormatProvider({ thousandSeparator: '.' })],
})
export class SeasonCheckComponent implements OnInit {

  constructor(private http: HttpClient) { }

  @Input() observer: any;
  index = 0;
  indexStats = 0;

  fixtures: Array<Fixture> = [];
  totalCount: number = 0;
  playedCount: number = 0;

  leagueTeams: Array<Team> = [];
  currentSeason: any = [];
  salariesCheck: boolean = false;

  season_league_winner: any = {};

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
        console.log(res);
        
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
        this.currentSeason = res;
        this.season_league_winner = JSON.parse(res.season_league_winner)[0];

        console.log(this.season_league_winner);
        
        
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }

}
