// src/app/views/fixtures/fixtures.module.ts
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FixturesComponent } from './fixtures.component';
import { MatchComponent } from './match/match.component';
import { LeagueTableSharedModule } from '../league-table/league-table-shared.module';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [
        FixturesComponent,
        MatchComponent
    ],
    imports: [
        SharedModule,
        CommonModule,
        LeagueTableSharedModule,
        RouterModule.forChild([{ path: '', component: FixturesComponent }])
    ]
})
export class FixturesModule { }