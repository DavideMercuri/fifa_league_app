import { Component, Inject, Input, OnInit } from '@angular/core';
import { Team } from 'src/interfaces/team.interfaces';
import { TeamDetailComponent } from '../team-detail.component';
import { HttpClient } from '@angular/common/http';
import { TuiAlertService, TuiNotification } from '@taiga-ui/core';
import { Transaction } from 'src/interfaces/transaction.interface';

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

    var teamSelected: any = this.selectedTeam.team_name;
    var transaction: Transaction;
    var payment = true;
    const body = { id, sum, payment };
    this.http.put('http://localhost:3000/players/team_detail/update-team-money', body).subscribe({
      next: () => {

        transaction = {
          transaction_mode: 'DEBIT',
          transaction_amount: this.selectedTeam.salary,
          transaction_date: new Date().toString(),
          transaction_team: teamSelected,
          transaction_detail: {
            type: 'salary_payment',
          },
          updated_team_money: this.selectedTeam.money - this.selectedTeam.salary
        }

      },
      complete: () => {
        this.registerTransaction(teamSelected, transaction);
        this.observer.complete();
        this.teamDetail.loadDataBasedOnId(String(id));
        this.alerts.open('Stipendi pagati con Successo!!', { label: 'Operazione Effettuata', status: TuiNotification.Success }).subscribe();
      }
    });
  }


  registerTransaction(transaction_team: string, transaction: Transaction) {

    const teamName = transaction_team;

    // Invia la transazione al server. Assicurati che il server accetti il nome del team anziché l'ID del team.
    this.http.post('http://localhost:3000/players/register-transaction', { teamName, transaction: transaction }).subscribe({
      next: (response) => {
        console.log('Transaction registered successfully', response);
      },
      error: (error) => {
        console.error('Error registering transaction', error);
      }
    });
  }

}
