import { HttpClient } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, Inject, Input, OnInit } from '@angular/core';
import { faCloudArrowUp, faFolderPlus } from '@fortawesome/free-solid-svg-icons';
import { TuiAlertService, TuiDialogContext, TuiDialogService, TuiDialogSize, TuiNotification } from '@taiga-ui/core';
import { PolymorpheusContent } from '@tinkoff/ng-polymorpheus';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-league-table',
  templateUrl: './league-table.component.html',
  styleUrls: ['./league-table.component.less']
})
export class LeagueTableComponent implements OnInit {

  constructor(private http: HttpClient, @Inject(TuiDialogService) private readonly dialogs: TuiDialogService, private cdRef: ChangeDetectorRef, @Inject(TuiAlertService)
  private readonly alerts: TuiAlertService,) { }

  faFolderPlus = faFolderPlus;
  faCloudArrowUp = faCloudArrowUp;

  disableDumpButton: boolean = false;

  @Input('fullModeVisualization') fullModeVisualization: boolean = true;
  @Input('homeVisualization') homeVisualization: boolean = false;

  ngOnInit(): void {
    this.GetLeagueTable();
  }

  leagueTable: any = [];

  columns = ['position', 'team', 'games_played', 'wins', 'draws', 'losses', 'goal_difference', 'points'];
  columnsMin = ['position', 'team', 'points'];

  GetLeagueTable() {
    this.http.get('http://localhost:3000/players/league_table').subscribe({
      next: (res) => {
        this.leagueTable = res;
      },
      error: (err: any) => {
        console.error(err);        
      },
      complete: () => {
        this.cdRef.detectChanges();
      }
    });
  }

  goalDifferenceStyle(gd: any): string {
    
    if (gd > 0) {
      return 'positive-gd-status';
    } else if (gd == 0) {
      return 'neutral-gd-status';
    } else if (gd < 0) {
      return 'negative-gd-status';
    }else{
      return '';
    }

  }

  openCheckSeasonModal(content: PolymorpheusContent<TuiDialogContext>, header: PolymorpheusContent, size: TuiDialogSize): void {
    this.dialogs.open(content, {
      size: size,
      dismissible: false,
    }).subscribe();
  }

  createBackup(){

    this.disableDumpButton = true;

    this.http.post('http://localhost:3000/backup-db', {}).subscribe({
      next: (response) => {
        console.log('Backup successfully created', response);
        this.alerts.open('Backup Creato con Successo!!', { label: 'Operazione Effettuata', status: TuiNotification.Success }).subscribe();
        this.disableDumpButton = false;
      },
      error: (error) => {
        console.error('Error in Backup creation', error);
        this.disableDumpButton = false;
      }
    });
  }

}
