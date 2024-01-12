import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { faStar, faFutbol } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-history-league-stats',
  templateUrl: './history-league-stats.component.html',
  styleUrls: ['./history-league-stats.component.less']
})
export class HistoryLeagueStatsComponent implements OnInit {

  constructor(private http: HttpClient){}

  @Input() selectedSummary: any;
  @Input() observer: any;

  teams: Array<any> = [];

  faStar = faStar;
  faFutbol = faFutbol;

  ngOnInit(): void {

    this.getTeamsForSelectedSeason(this.selectedSummary.season_id);
    
  }

  teamLogo(array: any, teamName: string) {
    
    if (array) {
      const teamObj = array.find((obj: any) => obj.team == teamName);
      return teamObj ? teamObj.team_logo : null;
    }else{
      setTimeout(() => {
        this.teamLogo(array, teamName);
      },100)
    }

  }

  getTeamsForSelectedSeason(season_id: any){
    this.http.get(`http://localhost:3000/players/history/${season_id}`).subscribe({
      next: (res: any) => {
        this.teams = res;  
      },
      error: (error) => {
        console.error(error);
      }
    })
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
  
  

}
