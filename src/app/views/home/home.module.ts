// src/app/views/fixtures/fixtures.module.ts
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { HomeComponent } from './home.component';
import { CommonModule } from '@angular/common';
import { LeagueTableSharedModule } from '../league-table/league-table-shared.module';
@NgModule({
    declarations: [HomeComponent],
    imports: [
        CommonModule,
        SharedModule,
        LeagueTableSharedModule,
        RouterModule.forChild([{ path: '', component: HomeComponent }])
    ]
})
export class HomeModule { }