import { AuthGuard } from './auth/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () =>
      import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'home',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./views/home/home.module').then(m => m.HomeModule)
  },

  // keep only lazy loading; the feature module provides its own declarations/imports (CommonModule etc.)
  {
    path: 'fixtures',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./views/fixtures/fixtures.module').then(m => m.FixturesModule)
  },
  {
    path: 'players',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./views/players/players.module').then(m => m.PlayersModule)
  },
  {
    path: 'league-table',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./views/league-table/league-table.module').then(m => m.LeagueTableModule)
  },
  {
    path: 'team-detail/:id',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./views/team-detail/team-detail.module').then(m => m.TeamDetailModule)
  },

  {
    path: 'history',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./views/history/history.module').then(m => m.HistoryModule)
  },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
