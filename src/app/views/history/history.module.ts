// src/app/views/fixtures/fixtures.module.ts
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { LeagueTableModule } from '../league-table/league-table.module';
import { HistoryComponent } from './history.component';
import { HistoryLeagueStatsComponent } from './history-league-stats/history-league-stats.component';
import { HistoryLeagueTableComponent } from './history-league-table/history-league-table.component';
import { HistoryPlayersStatsComponent } from './history-players-stats/history-players-stats.component';
import { HistoryTransactionsListComponent } from './history-transactions-list/history-transactions-list.component';
import { TeamDetailModule } from '../team-detail/team-detail.module';

@NgModule({
    declarations: [
        HistoryComponent,
        HistoryLeagueStatsComponent,
        HistoryLeagueTableComponent,
        HistoryPlayersStatsComponent,
        HistoryTransactionsListComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        LeagueTableModule,
        TeamDetailModule,
        RouterModule.forChild([{ path: '', component: HistoryComponent }])
    ]
})
export class HistoryModule { }