import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FixturesComponent } from './views/fixtures/fixtures.component';
import { HomeComponent } from './views/home/home.component';
import { PlayersComponent } from './views/players/players/players.component';

const routes: Routes = [
  { path: 'fixtures', component: FixturesComponent },
  { path: 'players', component: PlayersComponent},
  { path: 'home', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
