import { AfterViewInit, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Fixture {
  id_game: string;
  home_team: string;
  away_team: string;
  matchday: string;
  played: string;
  ht_goals: string;
  aw_goals: string;

}

@Component({
  selector: 'app-fixtures',
  templateUrl: './fixtures.component.html',
  styleUrls: ['./fixtures.component.less']
})
export class FixturesComponent implements OnInit, AfterViewInit {

  fixtures: Array<Fixture> = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getFixtures();

  }

  ngAfterViewInit(): void {

  }



  getFixtures() {
    this.http.get('http://localhost:3000/players/fixtures').subscribe({
      next: (res: any) => {
        this.fixtures = res;
      },
      complete: () => {
      }
    });
  }

  teamLogo(teamName: string): string {

    switch (teamName) {
      case 'Werder Brema':
        return 'https://i.imgur.com/qZ2N0Pd.png';
      case 'Real Madrid':
        return 'https://i.imgur.com/epsvCFz.png';
      case 'West Ham':
        return 'https://i.imgur.com/tZa7KjX.png';
      default:
        return '';
    }
  }

}
