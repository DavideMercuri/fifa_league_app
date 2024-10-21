import { HttpClient } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, Inject, Input, OnInit } from '@angular/core';
import { faCloudArrowUp, faFolderPlus } from '@fortawesome/free-solid-svg-icons';
import { TuiAlertService, TuiDialogContext, TuiDialogService, TuiDialogSize, TuiNotification } from '@taiga-ui/core';
import { PolymorpheusContent } from '@tinkoff/ng-polymorpheus';
import { Observable, Subscription } from 'rxjs';
import { WebsocketService } from 'src/app/websocket.service';

@Component({
  selector: 'app-league-table',
  templateUrl: './league-table.component.html',
  styleUrls: ['./league-table.component.less']
})
export class LeagueTableComponent implements OnInit {
  private activeNotifications: Subscription[] = []; // Array per memorizzare le notifiche attive

  constructor(
    private http: HttpClient,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private cdRef: ChangeDetectorRef,
    @Inject(TuiAlertService) private readonly alerts: TuiAlertService,
    private websocketService: WebsocketService // Aggiungi WebsocketService al costruttore
  ) {}

  faFolderPlus = faFolderPlus;
  faCloudArrowUp = faCloudArrowUp;

  disableDumpButton: boolean = false;

  goal_difference!: number;

  @Input('fullModeVisualization') fullModeVisualization: boolean = true;
  @Input('homeVisualization') homeVisualization: boolean = false;

  ngOnInit(): void {
    this.GetLeagueTable();

    // Ascolta i messaggi WebSocket per le notifiche in tempo reale
    this.websocketService.messages$.subscribe(() => {});
  }

  leagueTable: any = [];

  columns = ['position', 'team', 'games_played', 'wins', 'draws', 'losses', 'scored_goals', 'conceded_goals', 'goal_difference', 'points'];
  columnsMin = ['position', 'team', 'points'];

  GetLeagueTable() {
    this.http.get('http://localhost:3000/players/league_table').subscribe({
      next: (res: any) => {
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
    } else {
      return '';
    }
  }

  openCheckSeasonModal(content: PolymorpheusContent<TuiDialogContext>, header: PolymorpheusContent, size: TuiDialogSize): void {
    this.dialogs.open(content, {
      size: size,
      dismissible: false,
    }).subscribe();
  }

  createBackup() {
    this.disableDumpButton = true;

    // Mostra una notifica di "Backup in corso..." all'inizio del processo
    const backupInProgressNotification = this.alerts.open('Backup in corso...', { label: 'Operazione in corso', status: TuiNotification.Warning, autoClose: false });
    this.activeNotifications.push(backupInProgressNotification.subscribe());

    this.http.post('http://localhost:3000/backup-db', {}).subscribe({
      next: (response) => {
        console.log('Backup successfully created', response);

        // Chiudi tutte le notifiche attive prima di mostrarne una nuova
        this.activeNotifications.forEach(sub => sub.unsubscribe());
        this.activeNotifications = [];

        const successNotification = this.alerts.open('Backup Creato con Successo!!', { label: 'Operazione Effettuata', status: TuiNotification.Success });
        this.activeNotifications.push(successNotification.subscribe());

        this.disableDumpButton = false;
      },
      error: (error) => {
        console.error('Error in Backup creation', error);

        const errorNotification = this.alerts.open('Errore nel tentativo di Backup', { label: 'Operazione Fallita', status: TuiNotification.Error, autoClose: false });
        this.activeNotifications.push(errorNotification.subscribe());
        this.activeNotifications = [];

        this.disableDumpButton = false;
      }
    });
  }
}
