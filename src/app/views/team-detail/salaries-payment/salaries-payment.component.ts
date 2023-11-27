import { Component, Inject, Input, OnInit } from '@angular/core';
import { Team } from 'src/interfaces/team.interfaces';
import { TeamDetailComponent } from '../team-detail.component';
import { HttpClient } from '@angular/common/http';
import { TuiAlertService, TuiNotification } from '@taiga-ui/core';

@Component({
  selector: 'app-salaries-payment',
  templateUrl: './salaries-payment.component.html',
  styleUrls: ['./salaries-payment.component.less']
})
export class SalariesPaymentComponent implements OnInit {

  constructor(private http: HttpClient, private teamDetail: TeamDetailComponent, @Inject(TuiAlertService)
  private readonly alerts: TuiAlertService) { }

  @Input() selectedTeam!: Team;
  @Input() observer: any;

  label: string = '';

  ngOnInit(): void {
    this.label = 'Pagamento Stipendi e spese squadra: ' + this.selectedTeam.team_name;
  }

  paySalaries() {

    this.updateMoney(Number(this.selectedTeam.team_id), this.selectedTeam.money - this.selectedTeam.salary);

  }

  updateMoney(id: number, sum: number) {

    var payment = true;
    const body = { id, sum, payment };
    this.http.put('http://localhost:3000/players/team_detail/update-team-money', body).subscribe({
      complete: () => {
        this.observer.complete();
        this.teamDetail.loadDataBasedOnId(String(id));
        this.alerts.open('Stipendi pagati con Successo!!', { label: 'Operazione Effettuata', status: TuiNotification.Success }).subscribe();
      }
    });
  }

}
