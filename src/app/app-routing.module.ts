import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FixturesComponent } from './views/fixtures/fixtures.component';
import { HomeComponent } from './views/home/home.component';
import { PlayersComponent } from './views/players/players/players.component';
import { LeagueTableComponent } from './views/league-table/league-table/league-table.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'fixtures', component: FixturesComponent },
  { path: 'players', component: PlayersComponent},
  { path: 'league-table', component: LeagueTableComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
