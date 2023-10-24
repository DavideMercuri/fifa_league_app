import { AfterViewInit, Component, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TuiDialogContext, TuiDialogService, TuiDialogSize } from '@taiga-ui/core';
import { PolymorpheusContent } from '@tinkoff/ng-polymorpheus';
import { Fixture } from 'src/interfaces/fixture.interfaces';
import { Router } from '@angular/router';
import { faCircleExclamation, faCircleUp, faSquarePlus, faTruckMedical } from '@fortawesome/free-solid-svg-icons';
import { ScrollService } from 'src/app/scroll.service';

@Component({
  selector: 'app-fixtures',
  templateUrl: './fixtures.component.html',
  styleUrls: ['./fixtures.component.less']
})
export class FixturesComponent implements OnInit, AfterViewInit, OnDestroy  {
  
  tdStyleClass: string = 'tui-table__td tui-table__td_text_center team tui-table__td_first tui-table__td_last';
  trStyleClass: string = 'tui-table__tr tui-table__tr_border_none tui-table__tr_hover_disabled';
  tableStyleClass: string = 'tui-table tui-table__tr_hover_disabled tui-table_font-size_s';
  fixturesButtonStyleClass: string = 'action tui-table col-4 button-fixture';

  showScrollTopButton = false;

  fixtures: Array<Fixture> = [];
  match!: Fixture;

  faTruckMedical = faTruckMedical;
  faSquarePlus = faSquarePlus;
  faCircleExclamation = faCircleExclamation;
  faCircleUp = faCircleUp;

  constructor(private http: HttpClient, @Inject(TuiDialogService) private readonly dialogs: TuiDialogService, private scrollService: ScrollService) { }

  ngOnInit(): void {
    this.getFixtures();
  }

  ngAfterViewInit() {
    setTimeout( () => {
    if (this.scrollService.hasScrolled) {
      this.showScrollTopButton = true;
    }      
    }, 1000);
  }

  ngOnDestroy() {
    this.scrollService.hasScrolled = false;
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    this.showScrollTopButton = window.scrollY > 300;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getFixtures() {
    this.http.get('http://localhost:3000/players/fixtures').subscribe({
      next: (res: any) => {
        this.fixtures = res;
      },
      complete: () => {
      }
    });
  }

  teamLogo(teamName: string): string {

    switch (teamName) {
      case 'Arsenal':
        return 'https://i.imgur.com/jHecsme.png';
      case 'Real Madrid':
        return 'https://i.imgur.com/epsvCFz.png';
      case 'Borussia Dortmund':
        return 'https://i.imgur.com/3U25w5z.png';
      default:
        return '';
    }
  }

  onClick(
    content: PolymorpheusContent<TuiDialogContext>,
    header: PolymorpheusContent,
    size: TuiDialogSize, id: any): void {

    this.getSingleMatchInfo(id);

    this.dialogs.open(content, {
        label: '',
        header,
        size,
        dismissible: false,
      }).subscribe();
  }

  getSingleMatchInfo(id: any) {
    this.http.get(`http://localhost:3000/players/fixture?id=${id}`).subscribe({
      next: (res: any) => {
        this.match = res[0];
      }
    });
  }

}
