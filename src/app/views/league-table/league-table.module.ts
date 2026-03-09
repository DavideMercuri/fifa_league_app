import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LeagueTableComponent } from './league-table.component';
import { LeagueTableSharedModule } from './league-table-shared.module';

@NgModule({
    // no declarations here; they live in LeagueTableSharedModule
    imports: [
        LeagueTableSharedModule, // components + Common/Shared
        RouterModule.forChild([{ path: '', component: LeagueTableComponent }]) // routing only qui
    ]
})
export class LeagueTableModule { }
