import { LeagueTableComponent } from './league-table.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { SeasonCheckComponent } from './season-check/season-check.component';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [
        LeagueTableComponent,
        SeasonCheckComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild([
            { path: '', component: LeagueTableComponent }
        ])
    ],
    exports: [
        LeagueTableComponent
    ]
})
export class LeagueTableModule { }
