import { AuthGuard } from './auth/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FixturesComponent } from './views/fixtures/fixtures.component';
import { HomeComponent } from './views/home/home.component';
import { PlayersComponent } from './views/players/players/players.component';
import { LeagueTableComponent } from './views/league-table/league-table/league-table.component';
import { LoginComponent } from './auth/login/login.component';
import { TeamDetailComponent } from './views/team-detail/team-detail.component';
import { HistoryComponent } from './views/history/history.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'fixtures', component: FixturesComponent, canActivate: [AuthGuard] },
  { path: 'players', component: PlayersComponent, canActivate: [AuthGuard] },
  { path: 'league-table', component: LeagueTableComponent, canActivate: [AuthGuard] },
  { path: 'team-detail/:id', component: TeamDetailComponent, canActivate: [AuthGuard] },
  { path: 'history', component: HistoryComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
