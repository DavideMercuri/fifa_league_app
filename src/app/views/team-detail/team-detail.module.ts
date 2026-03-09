import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { TeamDetailComponent } from './team-detail.component';
import { EditTeamComponent } from './edit-team/edit-team.component';
import { SalariesPaymentComponent } from './salaries-payment/salaries-payment.component';
import { TradePlayersComponent } from './trade-players/trade-players.component';
import { TrophyAwardMenuComponent } from './trophy-award-menu/trophy-award-menu.component';
import { TeamTransactionModule } from './team-transaction/team-transaction.module';

@NgModule({
    declarations: [
        TeamDetailComponent,
        EditTeamComponent,
        TrophyAwardMenuComponent,
        SalariesPaymentComponent,
        TradePlayersComponent
    ],
    imports: [
        SharedModule,
        TeamTransactionModule,
        RouterModule.forChild([
            { path: '', component: TeamDetailComponent },
            { path: 'edit',   component: EditTeamComponent },
        ])
    ], exports: [
        SharedModule,
    ]
})
export class TeamDetailModule { }
