import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Player } from 'src/interfaces/player.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit, AfterViewInit {

  constructor(private http: HttpClient) { }

  ngAfterViewInit(): void {
    console.log(this.carousel);
    
  }

  topScorer: any | undefined;
  topAssist: any | undefined;
  topMotm: any | undefined;
  items!: Array<any>;

  index = 0;

  @ViewChild('carousel') carousel: any;

  ngOnInit(): void {

    setTimeout(()=> {
      this.getTopPlayersInfo('goals');
      this.getTopPlayersInfo('assist');
      this.getTopPlayersInfo('motm');
    }, 0);
  }

  getTopPlayersInfo(category: string): void {
    this.http.get(`http://localhost:3000/players/players_list/top_players?category=${category}`).subscribe({
      next: (res: any) => {
        switch (category) {
          case 'goals':
            this.topScorer = { ...res[0], ...{label: 'Miglior Marcatore'} };            
            break;
          case 'assist':
            this.topAssist = { ...res[0], ...{label: 'Miglior Assistman'} }; 
            break;
          case 'motm':
            this.topMotm = { ...res[0], ...{label: 'Miglior Motm'} }; 
            break;
        }
      }
    });
  }
}
