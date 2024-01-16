import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-history-players-stats',
  templateUrl: './history-players-stats.component.html',
  styleUrls: ['./history-players-stats.component.less']
})
export class HistoryPlayersStatsComponent implements OnInit, AfterViewInit, OnDestroy  {

  constructor(private http: HttpClient) { }

  @Input() selectedSummary: any;
  @Input() observer: any;

  top_scorers: Array<any> = [];
  top_assist: Array<any> = [];
  top_motm: Array<any> = [];
  baloon_dor: Array<any> = [];

  teams: Array<any> = [];

  ngOnInit(): void {

    this.getTeamsForSelectedSeason(this.selectedSummary.season_id);

    this.top_scorers = this.selectedSummary.season_top_scorers;
    this.top_assist = this.selectedSummary.season_top_assist;
    this.top_motm = this.selectedSummary.season_top_motm;
    this.baloon_dor = this.selectedSummary.season_ballon_dOr;

  }

  private observerStyle!: MutationObserver;

  ngAfterViewInit(): void {
    this.observerStyle = new MutationObserver(mutations => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          const element = document.querySelector('tui-dialog div.t-content');
          if (element) {
            this.removeSpecificClass(element, 't-content');
            this.observerStyle.disconnect();
          }
        }
      });
    });

    this.observerStyle.observe(document.body, { childList: true, subtree: true });
  }

  ngOnDestroy(): void {
    if (this.observerStyle) {
      this.observerStyle.disconnect();
    }
  }

  getTeamsForSelectedSeason(season_id: any) {
    this.http.get(`http://localhost:3000/players/history/${season_id}`).subscribe({
      next: (res: any) => {
        this.teams = res;
      },
      error: (error) => {
        console.error(error);
      }
    })
  }

  teamLogo(array: any, teamName: string) {

    if (array) {
      const teamObj = array.find((obj: any) => obj.team == teamName);
      return teamObj ? teamObj.team_logo : null;
    } else {
      setTimeout(() => {
        this.teamLogo(array, teamName);
      }, 100)
    }

  }

  convertImgToBase64(img: { data: number[] }): string {
    if (img && img.data) {
      const byteCharacters = String.fromCharCode(...img.data);
      const base64String = btoa(byteCharacters);
      return `data:image/png;base64,${base64String}`;
    } else {
      this.convertImgToBase64(img);
      return '';
    }
  }

  removeSpecificClass(element: Element, className: string): void {

    if (element.classList.contains(className)) {
      element.classList.remove(className);

      element.classList.add('pd-40');
    }
  }

}
