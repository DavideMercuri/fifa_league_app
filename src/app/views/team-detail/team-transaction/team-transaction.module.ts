import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { TeamTransactionComponent } from './team-transaction.component';

@NgModule({
    declarations: [
        TeamTransactionComponent
    ],
    imports: [
        SharedModule
    ],
    exports: [
        TeamTransactionComponent
    ]
})
export class TeamTransactionModule { }
