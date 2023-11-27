import { HttpClient } from '@angular/common/http';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { faShieldHalved, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { UCLInfo, leagueInfo } from 'src/app/components/navbar/common-data';
import { Team } from 'src/interfaces/team.interfaces';
import { TeamDetailComponent } from '../team-detail.component';
import { TuiAlertService, TuiNotification } from '@taiga-ui/core';

@Component({
  selector: 'app-trophy-award-menu',
  templateUrl: './trophy-award-menu.component.html',
  styleUrls: ['./trophy-award-menu.component.less']
})

export class TrophyAwardMenuComponent implements OnInit {

  constructor(private http: HttpClient, private teamDetail: TeamDetailComponent, @Inject(TuiAlertService)
  private readonly alerts: TuiAlertService) { }

  @Input() selectedTeam!: Team;
  @Input() observer: any;

  leagueInfo = leagueInfo;
  UCLInfo = UCLInfo;

  faShieldHalved = faShieldHalved;
  faTrophy = faTrophy;

  awardForm = new FormGroup({
    awardCampionato: new FormControl(),
    awardChampionsLeague: new FormControl(),
    awardCup: new FormControl(false),
    awardBestScorer: new FormControl(false),
    awardBestAssistman: new FormControl(false),
    awardBestMotm: new FormControl(false),
    awardBestScorerUcl: new FormControl(false),
    awardGoldenBall: new FormControl(false),
  });

  ngOnInit(): void {

  }

  save() {

    let totalSum = 0;

    const checkboxValues: any = {
      awardCup: 5000000,
      awardBestScorer: 15000000,
      awardBestAssistman: 10000000,
      awardBestMotm: 5000000,
      awardBestScorerUcl: 10000000,
      awardGoldenBall: 10000000,
    };

    Object.keys(this.awardForm.controls).forEach(key => {
      const control = this.awardForm.get(key);

      if (control) {

        if (control.value) {
          if (typeof control.value === 'object' && control.value.hasOwnProperty('awardValue')) {
            totalSum += control.value.awardValue;
          } else if (typeof control.value === 'boolean' && control.value === true) {
            totalSum += checkboxValues[key];
          }
        }
      }
    });

    this.updateMoney(Number(this.selectedTeam.team_id), totalSum);

  }

  updateMoney(id: number, sum: number) {
 
    const body = { id, sum };
    this.http.put('http://localhost:3000/players/team_detail/update-team-money', body).subscribe({
      complete: () => {
        this.observer.complete();
        this.teamDetail.loadDataBasedOnId(String(id));
        this.alerts.open('Modifica Avvenuta con Successo!!', { label: 'Operazione Effettuata', status: TuiNotification.Success }).subscribe();
      }
    });
  }

}