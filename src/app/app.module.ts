import { NgDompurifySanitizer } from "@tinkoff/ng-dompurify";
import { TuiRootModule, TuiDialogModule, TuiNotificationModule, TuiAlertModule, TUI_SANITIZER, TuiButtonModule, TuiDataListModule, TuiTextfieldControllerModule, TuiLabelModule, TuiSvgModule, TuiLoaderModule, TuiFormatNumberPipeModule, TuiTooltipModule, TuiExpandModule, TuiDropdownModule, TuiHintModule, TuiScrollbarModule } from "@taiga-ui/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TuiAccordionModule, TuiActionModule, TuiAvatarModule, TuiBadgeModule, TuiBadgedContentModule, TuiCarouselModule, TuiCheckboxBlockModule, TuiCheckboxLabeledModule, TuiComboBoxModule, TuiDataListWrapperModule, TuiElasticContainerModule, TuiInputFilesModule, TuiInputModule, TuiInputNumberModule, TuiInputPasswordModule, TuiInputYearModule, TuiIslandModule, TuiLazyLoadingModule, TuiMarkerIconModule, TuiMultiSelectModule, TuiPaginationModule, TuiSelectModule, TuiStepperModule, TuiTabsModule, TuiTagModule, TuiTextAreaModule, TuiToggleModule } from "@taiga-ui/kit";
import { TuiAppBarModule, TuiSidebarModule, TuiTabBarModule } from '@taiga-ui/addon-mobile';
import { TuiCalendarModule } from '@taiga-ui/core';
import { TuiActiveZoneModule, TuiLetModule } from '@taiga-ui/cdk';

import { TUI_LANGUAGE, TUI_ITALIAN_LANGUAGE } from '@taiga-ui/i18n';

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
import { ColorChromeModule } from 'ngx-color/chrome';
import { ColorTwitterModule } from 'ngx-color/twitter';
import { of } from "rxjs";
import { LoginComponent } from './auth/login/login.component';
import { TeamDetailComponent } from './views/team-detail/team-detail.component';
import { ScrollToNotPlayedDirective } from './scroll-to-not-played.directive';
import { TrophyAwardMenuComponent } from './views/team-detail/trophy-award-menu/trophy-award-menu.component';
import { SalariesPaymentComponent } from './views/team-detail/salaries-payment/salaries-payment.component';
import { TradePlayersComponent } from './views/team-detail/trade-players/trade-players.component';
import { EditTeamComponent } from './views/team-detail/edit-team/edit-team.component';
import { ClickOutsideDirective } from './components/navbar/click-outside.directive';
import { HistoryComponent } from "./views/history/history.component";
import { HistoryLeagueStatsComponent } from './views/history/history-league-stats/history-league-stats.component';
import { HistoryPlayersStatsComponent } from './views/history/history-players-stats/history-players-stats.component';
import { LeagueTableComponent } from "./views/league-table/league-table.component";
import { EditPlayerComponent } from "./views/players/edit-player/edit-player.component";
import { InsertPlayerComponent } from "./views/players/insert-player/insert-player.component";
import { PlayersComponent } from "./views/players/players.component";
import { SeasonCheckComponent } from './views/league-table/season-check/season-check.component';
import { TeamTransactionComponent } from './views/team-detail/team-transaction/team-transaction.component';
import localeIt from '@angular/common/locales/it';
import { registerLocaleData } from '@angular/common';
import { HistoryLeagueTableComponent } from './views/history/history-league-table/history-league-table.component';
import { HistoryTransactionsListComponent } from './views/history/history-transactions-list/history-transactions-list.component';
import { NotificationComponent } from './components/notification/notification.component';
import { WebsocketService } from "./websocket.service";

// Registra il locale italiano
registerLocaleData(localeIt);


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
    LoginComponent,
    TeamDetailComponent,
    ScrollToNotPlayedDirective,
    TrophyAwardMenuComponent,
    SalariesPaymentComponent,
    InsertPlayerComponent,
    EditPlayerComponent,
    TradePlayersComponent,
    EditTeamComponent,
    ClickOutsideDirective,
    HistoryComponent,
    HistoryLeagueStatsComponent,
    HistoryPlayersStatsComponent,
    SeasonCheckComponent,
    TeamTransactionComponent,
    HistoryLeagueTableComponent,
    HistoryTransactionsListComponent,
    NotificationComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
    ColorChromeModule,
    ColorTwitterModule,
    TuiRootModule,
    TuiNotificationModule,
    TuiDialogModule,
    TuiTableModule,
    TuiTablePaginationModule,
    TuiAlertModule,
    TuiInputNumberModule,
    TuiFormatNumberPipeModule,
    TuiActionModule,
    TuiInputModule,
    TuiTextAreaModule,
    TuiInputFilesModule,
    TuiInputYearModule,
    TuiDropdownModule,
    TuiCheckboxBlockModule,
    TuiMarkerIconModule,
    TuiAccordionModule,
    TuiTooltipModule,
    TuiStepperModule,
    TuiSidebarModule,
    TuiActiveZoneModule,
    TuiInputPasswordModule,
    TuiPaginationModule,
    TuiComboBoxModule,
    TuiCheckboxLabeledModule,
    TuiToggleModule,
    TuiAppBarModule,
    TuiCalendarModule,
    TuiLoaderModule,
    TuiHintModule,
    TuiTableFiltersModule,
    TuiSvgModule,
    TuiTabsModule,
    TuiButtonModule,
    TuiTabBarModule,
    TuiBadgeModule,
    TuiBadgedContentModule,
    TuiCarouselModule,
    TuiIslandModule,
    TuiScrollbarModule,
    TuiLazyLoadingModule,
    FormsModule,
    ReactiveFormsModule,
    TuiMultiSelectModule,
    TuiSelectModule,
    TuiDataListWrapperModule,
    TuiAvatarModule,
    TuiLabelModule,
    TuiLetModule,
    TuiTagModule,
    TuiDataListModule,
    TuiTextfieldControllerModule,
    TuiDataListWrapperModule,
    TuiElasticContainerModule,
    TuiExpandModule,
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
    { provide: LOCALE_ID, useValue: 'it' },
    WebsocketService
  ],
  bootstrap: [AppComponent]
  ,
  exports: [ScrollToNotPlayedDirective]
})
export class AppModule { }
