import { Component, Input, OnInit } from '@angular/core';
import { Team } from 'src/interfaces/team.interfaces';
import { Transaction } from 'src/interfaces/transaction.interface';
import { TuiAlertService, TuiNotification, tuiNumberFormatProvider } from '@taiga-ui/core';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-team-transaction',
  templateUrl: './team-transaction.component.html',
  styleUrls: ['./team-transaction.component.less'],
  providers: [tuiNumberFormatProvider({ thousandSeparator: '.' })],
})
export class TeamTransactionComponent implements OnInit {


  @Input() observer: any;
  @Input() selectedTeam!: Team;

  faMagnifyingGlass = faMagnifyingGlass;
  hintShown = false;

  teamTransactions: Array<Transaction> = []
  readonly columns = ['tipo', 'importo', 'data', 'causale', 'dettaglio', 'saldo'];


  ngOnInit(): void {
    
    this.teamTransactions = JSON.parse(String(this.selectedTeam.team_transactions));

  }

  toggleHint(): void {
    this.hintShown = !this.hintShown;
  }

}
