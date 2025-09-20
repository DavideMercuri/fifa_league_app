import { Injectable } from '@angular/core';
import { Player } from 'src/interfaces/player.interface';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  playersList: Array<Player> = [];
  wins: any; 
  draws: any;
  losses: any;
  goalDiff: any;

  constructor() { }

  getPlayersList(): Array<Player>{
    return this.playersList;
  }

  setPlayersList(list: Array<Player>): void{
    this.playersList = list;
  }

  getWinsStats(): any{
    return this.wins;
  }

  setWinsStats(wins: any): void{
    this.wins = wins;
  }

  getDrawsStats(): any{
    return this.draws;
  }

  setDrawsStats(draws: any): void{
    this.draws = draws;
  }

  getLossesStats(): any{
    return this.losses;
  }

  setLossesStats(losses: any): void{
    this.losses = losses;
  }
  
  setgoalDiff(goalDiff: any): void{
    this.goalDiff = goalDiff;
  }

  getgoalDiff(): any{
    return this.goalDiff;
  }
}
