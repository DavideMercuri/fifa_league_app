import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-history-league-table',
  templateUrl: './history-league-table.component.html',
  styleUrls: ['./history-league-table.component.less']
})
export class HistoryLeagueTableComponent {

  @Input() selectedSummary: any;
  @Input() observer: any;

  leagueStats: any[] = [];
  fullModeVisualization: boolean = true;

  columns = ['position', 'team', 'games_played', 'wins', 'draws', 'losses', 'goal_difference', 'points'];

  ngOnInit(): void {

    this.calculateStats();

  }

  calculateStats(): void {
    const fixtures = this.selectedSummary.season_fixtures;
    const leagueTable = this.selectedSummary.season_league_table;
    const teamStats: any = {};

    // Inizializza le statistiche per ogni squadra dai risultati di fixture
    fixtures.forEach((game: any) => {
      [game.home_team, game.away_team].forEach(team => {
        if (!teamStats[team]) {
          teamStats[team] = { wins: 0, losses: 0, draws: 0, goalsFor: 0, goalsAgainst: 0, gamesPlayed: 0 };
        }
      });

      // Aggiorna le partite giocate
      teamStats[game.home_team].gamesPlayed++;
      teamStats[game.away_team].gamesPlayed++;

      // Aggiorna reti fatte e subite
      teamStats[game.home_team].goalsFor += game.ht_goals;
      teamStats[game.home_team].goalsAgainst += game.aw_goals;
      teamStats[game.away_team].goalsFor += game.aw_goals;
      teamStats[game.away_team].goalsAgainst += game.ht_goals;

      // Determina risultato della partita e aggiorna vittorie, sconfitte e pareggi
      if (game.ht_goals > game.aw_goals) {
        teamStats[game.home_team].wins++;
        teamStats[game.away_team].losses++;
      } else if (game.ht_goals < game.aw_goals) {
        teamStats[game.home_team].losses++;
        teamStats[game.away_team].wins++;
      } else {
        teamStats[game.home_team].draws++;
        teamStats[game.away_team].draws++;
      }
    });

    // Aggiungi dati da season_league_table
    leagueTable.forEach((team: any) => {
      if (teamStats[team.team]) {
        teamStats[team.team].points = team.points;
        teamStats[team.team].position = leagueTable.findIndex((t: any) => t.team === team.team) + 1; // Calcola la posizione
        teamStats[team.team].team_logo = team.team_logo_base64; // Usa il logo in base64
      }
    });

    // Converti l'oggetto in un array
    this.leagueStats = Object.keys(teamStats).map(team => ({
      team: team,
      wins: teamStats[team].wins,
      losses: teamStats[team].losses,
      draws: teamStats[team].draws,
      goalsFor: teamStats[team].goalsFor,
      goalsAgainst: teamStats[team].goalsAgainst,
      goalDifference: teamStats[team].goalsFor - teamStats[team].goalsAgainst,
      gamesPlayed: teamStats[team].gamesPlayed,
      points: teamStats[team].points,
      position: teamStats[team].position,
      team_logo: teamStats[team].team_logo
    }));

    // Ordina per posizione
    this.leagueStats.sort((a, b) => b.points - a.points);

  }


  

}
