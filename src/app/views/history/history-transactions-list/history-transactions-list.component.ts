import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-history-transactions-list',
  templateUrl: './history-transactions-list.component.html',
  styleUrls: ['./history-transactions-list.component.less']
})
export class HistoryTransactionsListComponent {

  @Input() selectedSummary: any;
  @Input() observer: any;

  activeItemIndex = 0;

}
