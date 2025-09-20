import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { PlayersComponent } from './players.component';
import { EditPlayerComponent } from './edit-player/edit-player.component';
import { InsertPlayerComponent } from './insert-player/insert-player.component';

@NgModule({
    declarations: [
        PlayersComponent,
        EditPlayerComponent,
        InsertPlayerComponent
    ],
    imports: [
        SharedModule,
        RouterModule.forChild([
            { path: '', component: PlayersComponent }
        ])
    ]
})
export class PlayersModule { }
