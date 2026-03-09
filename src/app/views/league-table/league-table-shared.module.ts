import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { LeagueTableComponent } from './league-table.component';
import { SeasonCheckComponent } from './season-check/season-check.component';

@NgModule({
    declarations: [
        LeagueTableComponent,
        SeasonCheckComponent
    ],
    imports: [
        CommonModule,
        SharedModule
    ],
    exports: [
        LeagueTableComponent,
        SeasonCheckComponent
    ]
})
export class LeagueTableSharedModule { }