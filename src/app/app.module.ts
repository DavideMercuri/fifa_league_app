import { NgDompurifySanitizer } from "@tinkoff/ng-dompurify";
import { TuiRootModule, TuiDialogModule, TuiAlertModule, TUI_SANITIZER, TuiButtonModule, TuiDataListModule, TuiTextfieldControllerModule, TuiLabelModule, TuiSvgModule, TuiLoaderModule } from "@taiga-ui/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TuiActionModule, TuiAvatarModule, TuiBadgeModule, TuiCarouselModule, TuiComboBoxModule, TuiDataListWrapperModule, TuiInputModule, TuiInputNumberModule, TuiInputPasswordModule, TuiIslandModule, TuiMultiSelectModule, TuiPaginationModule, TuiSelectModule, TuiTabsModule, TuiTagModule } from "@taiga-ui/kit";
import { TuiAppBarModule, TuiTabBarModule } from '@taiga-ui/addon-mobile';
import { TuiCalendarModule } from '@taiga-ui/core';
import { TuiLetModule } from '@taiga-ui/cdk';

import {TUI_LANGUAGE, TUI_ITALIAN_LANGUAGE} from '@taiga-ui/i18n';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FixturesComponent } from './views/fixtures/fixtures.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HttpClientModule } from "@angular/common/http";
import { HomeComponent } from "./views/home/home.component";
import { MatchComponent } from './views/fixtures/match/match.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TuiTagDirectiveDirective } from './views/fixtures/match/tui-tag-directive.directive';
import { TuiTableFiltersModule, TuiTableModule, TuiTablePaginationModule } from "@taiga-ui/addon-table";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PlayersComponent } from './views/players/players/players.component';
import { of } from "rxjs";
import { LeagueTableComponent } from './views/league-table/league-table/league-table.component';
import { LoginComponent } from './auth/login/login.component';


@NgModule({
  declarations: [
    AppComponent,
    FixturesComponent,
    NavbarComponent,
    HomeComponent,
    MatchComponent,
    TuiTagDirectiveDirective,
    PlayersComponent,
    LeagueTableComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
    TuiRootModule,
    TuiDialogModule,
    TuiTableModule,
    TuiTablePaginationModule,
    TuiAlertModule,
    TuiInputNumberModule,
    TuiActionModule,
    TuiInputModule,
    TuiInputPasswordModule,
    TuiPaginationModule,
    TuiComboBoxModule,
    TuiAppBarModule,
    TuiCalendarModule,
    TuiLoaderModule,
    TuiTableFiltersModule,
    TuiSvgModule,
    TuiTabsModule,
    TuiButtonModule,
    TuiTabBarModule,
    TuiBadgeModule,
    TuiCarouselModule,
    TuiIslandModule,
    FormsModule,
    ReactiveFormsModule,
    TuiMultiSelectModule,
    TuiSelectModule,
    TuiDataListWrapperModule ,
    TuiAvatarModule,
    TuiLabelModule,
    TuiLetModule,
    TuiTagModule,
    TuiDataListModule,
    TuiTextfieldControllerModule,
    TuiDataListWrapperModule,
    HttpClientModule,
  ],
  providers: [
  {
    provide: TUI_SANITIZER,
    useClass: NgDompurifySanitizer
  },
  {
    provide: TUI_SANITIZER,
    useClass: NgDompurifySanitizer
  },
  {
    provide: TUI_LANGUAGE,
    useValue: of(TUI_ITALIAN_LANGUAGE),
  },
],
  bootstrap: [AppComponent]
})
export class AppModule { }
