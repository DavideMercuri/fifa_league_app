import { NgDompurifySanitizer } from "@tinkoff/ng-dompurify";
import { TuiRootModule, TuiDialogModule, TuiAlertModule, TUI_SANITIZER, TuiButtonModule, TuiDataListModule, TuiTextfieldControllerModule, TuiLabelModule, TuiSvgModule, TuiLoaderModule, TuiFormatNumberPipeModule, TuiTooltipModule, TuiExpandModule, TuiDropdownModule, TuiHintModule } from "@taiga-ui/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TuiAccordionModule, TuiActionModule, TuiAvatarModule, TuiBadgeModule, TuiCarouselModule, TuiCheckboxBlockModule, TuiCheckboxLabeledModule, TuiComboBoxModule, TuiDataListWrapperModule, TuiElasticContainerModule, TuiInputFilesModule, TuiInputModule, TuiInputNumberModule, TuiInputPasswordModule, TuiIslandModule, TuiLazyLoadingModule, TuiMarkerIconModule, TuiMultiSelectModule, TuiPaginationModule, TuiSelectModule, TuiTabsModule, TuiTagModule, TuiToggleModule } from "@taiga-ui/kit";
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
import { TeamDetailComponent } from './views/team-detail/team-detail.component';
import { ScrollToNotPlayedDirective } from './scroll-to-not-played.directive';
import { TrophyAwardMenuComponent } from './views/team-detail/trophy-award-menu/trophy-award-menu.component';
import { SalariesPaymentComponent } from './views/team-detail/salaries-payment/salaries-payment.component';
import { InsertPlayerComponent } from './views/players/players/insert-player/insert-player.component';
import { EditPlayerComponent } from './views/players/players/edit-player/edit-player.component';
import { TradePlayersComponent } from './views/team-detail/trade-players/trade-players.component';


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
    TuiFormatNumberPipeModule,
    TuiActionModule,
    TuiInputModule,
    TuiInputFilesModule,
    TuiDropdownModule,
    TuiCheckboxBlockModule,
    TuiMarkerIconModule,
    TuiAccordionModule,
    TuiTooltipModule,
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
    TuiCarouselModule,
    TuiIslandModule,
    TuiLazyLoadingModule,
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
],
  bootstrap: [AppComponent]
  ,
  exports: [ScrollToNotPlayedDirective]
})
export class AppModule { }
