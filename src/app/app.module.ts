import { NgDompurifySanitizer } from "@tinkoff/ng-dompurify";
import { TuiRootModule, TuiDialogModule, TuiAlertModule, TUI_SANITIZER, TuiButtonModule, TuiDataListModule, TuiTextfieldControllerModule, TuiLabelModule, TuiSvgModule, TuiLoaderModule } from "@taiga-ui/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TuiActionModule, TuiAvatarModule, TuiBadgeModule, TuiCarouselModule, TuiComboBoxModule, TuiDataListWrapperModule, TuiIslandModule, TuiMultiSelectModule, TuiSelectModule, TuiTagModule } from "@taiga-ui/kit";
import { TuiAppBarModule, TuiTabBarModule } from '@taiga-ui/addon-mobile';
import { TuiCalendarModule } from '@taiga-ui/core';
import {TuiLetModule} from '@taiga-ui/cdk';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FixturesComponent } from './views/fixtures/fixtures.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HttpClientModule } from "@angular/common/http";
import { HomeComponent } from "./views/home/home.component";
import { MatchComponent } from './views/fixtures/match/match.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TuiTagDirectiveDirective } from './views/fixtures/match/tui-tag-directive.directive';
import { TuiTableModule } from "@taiga-ui/addon-table";


@NgModule({
  declarations: [
    AppComponent,
    FixturesComponent,
    NavbarComponent,
    HomeComponent,
    MatchComponent,
    TuiTagDirectiveDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    TuiRootModule,
    TuiDialogModule,
    TuiTableModule,
    TuiAlertModule,
    TuiActionModule,
    TuiComboBoxModule,
    TuiAppBarModule,
    TuiCalendarModule,
    TuiLoaderModule,
    TuiSvgModule,
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
    HttpClientModule
  ],
  providers: [
  {
    provide: TUI_SANITIZER,
    useClass: NgDompurifySanitizer
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
