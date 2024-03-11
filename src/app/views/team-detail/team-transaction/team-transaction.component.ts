import { Component, Input, OnInit } from '@angular/core';
import { Team } from 'src/interfaces/team.interfaces';
import { Transaction } from 'src/interfaces/transaction.interface';
import { TuiAlertService, TuiNotification, tuiNumberFormatProvider } from '@taiga-ui/core';

@Component({
  selector: 'app-team-transaction',
  templateUrl: './team-transaction.component.html',
  styleUrls: ['./team-transaction.component.less'],
  providers: [tuiNumberFormatProvider({ thousandSeparator: '.' })],
})
export class TeamTransactionComponent implements OnInit {


  @Input() observer: any;
  @Input() selectedTeam!: Team;

  teamTransactions: Array<Transaction> = []
  readonly columns = ['tipo', 'importo', 'data', 'causale', 'dettaglio', 'saldo'];


  ngOnInit(): void {
    
    this.teamTransactions = JSON.parse(String(this.selectedTeam.team_transactions));
    
  }

}
