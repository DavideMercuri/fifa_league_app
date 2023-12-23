import { HttpClient, HttpParams } from '@angular/common/http';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TuiAlertService, TuiNotification } from '@taiga-ui/core';
import { ColorEvent } from 'ngx-color';
import { Player } from 'src/interfaces/player.interface';
import { Team } from 'src/interfaces/team.interfaces';
import { TeamDetailComponent } from '../team-detail.component';
import { Observable, Subject, delay, filter, finalize, map, of, startWith, switchMap, timer } from 'rxjs';
import { TUI_DEFAULT_MATCHER, TuiContextWithImplicit, TuiStringHandler } from '@taiga-ui/cdk';
import { TuiFileLike } from '@taiga-ui/kit';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';
import { SubMenuVoicesService } from 'src/app/sub-menu-voices.service';

class PlayerSearch implements Player {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly position: string,
    readonly country: string,
    readonly team: string,
    readonly goals: number,
    readonly assist: number,
    readonly motm: number,
    readonly yellow_card: number,
    readonly red_card: number,
    readonly salary: number,
    readonly overall: number,
    readonly player_value: number,
    readonly photo: string,
  ) { }
}

@Component({
  selector: 'app-edit-team',
  templateUrl: './edit-team.component.html',
  styleUrls: ['./edit-team.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditTeamComponent implements OnInit, AfterViewInit {

  constructor(private http: HttpClient, @Inject(TuiAlertService) private readonly alerts: TuiAlertService,
    private teamDetail: TeamDetailComponent, private changeDetectorRef: ChangeDetectorRef, private subMenuVoices: SubMenuVoicesService) { }


  teamInfo = new FormGroup({
    team_name: new FormControl(),
    captain: new FormControl(),

  });

  @Input() observer: any;
  @Input() selectedTeam!: Team;

  selectedMainColor: any;
  selectedTextColor: any;
  selectedSecondaryColor: any;
  hiddenPickerMain: boolean = true;
  hiddenPickerSecondary: boolean = true;
  hiddenPickerText: boolean = true;
  teamPlayers: Array<any> = [];
  captain: any;

  imageSrc: string | ArrayBuffer | null = null;

  bufferedImg: any;

  teamName: any;
  oldTeamName: any;

  readonly control = new FormControl();

  readonly rejectedFiles$ = new Subject<TuiFileLike | null>();
  readonly loadingFiles$ = new Subject<TuiFileLike | null>();
  readonly loadedFiles$ = this.control.valueChanges.pipe(
    switchMap(file => (file ? this.makeRequest(file) : of(null))),
  );

  ngOnInit(): void {

    this.filterPlayers(this.selectedTeam.team_name);
    this.selectedMainColor = this.selectedTeam.team_main_color;
    this.selectedSecondaryColor = this.selectedTeam.team_secondary_color;
    this.selectedTextColor = this.selectedTeam.team_text_color;
    this.teamInfo.controls['team_name'].setValue(this.selectedTeam.team_name);

  }

  ngAfterViewInit(): void {

    setTimeout(() => {

      if (this.selectedTeam.team_logo) {
        // Converti la stringa base64 in un Blob
        const imageBlob = this.base64ToBlob(this.selectedTeam.team_logo.split(',')[1], 'image/webp');
        const imageName = `${this.selectedTeam.team_logo}_logo.webp`;
        const imageFile = new File([imageBlob], imageName, { type: 'image/webp' });

        this.control.setValue(imageFile);
        this.imageSrc = this.selectedTeam.team_logo;
      }
      this.oldTeamName = this.selectedTeam.team_name;
      this.captain = this.teamPlayers.filter(item => item.name == this.selectedTeam.captain);
      this.teamInfo.controls['captain'].setValue(this.captain[0]);
    }, 200);

  }

  onSearchChange(searchQuery: string | null): void {
    this.search$.next(searchQuery);
  }

  extractValueFromEvent(event: Event): string | null {
    return (event.target as HTMLInputElement)?.value || null;
  }

  readonly search$ = new Subject<string | null>();

  readonly items$: Observable<readonly PlayerSearch[] | null> = this.search$.pipe(
    filter(value => value !== null),
    switchMap(search =>
      this.serverRequest(search).pipe(startWith<readonly PlayerSearch[] | null>(null)),
    ),
    startWith(this.teamPlayers),
  );

  readonly stringify: TuiStringHandler<PlayerSearch | TuiContextWithImplicit<PlayerSearch>> = item =>
    typeof item === 'object' && item !== null && 'name' in item
      ? item.name
      : '';

  private serverRequest(searchQuery: string | null): Observable<readonly PlayerSearch[]> {
    const result = this.teamPlayers.filter(user =>
      TUI_DEFAULT_MATCHER(user.name, searchQuery || ''),
    );

    return of(result).pipe(delay(200));
  }

  // Commuta la visibilità del color picker
  togglePicker(state: string) {

    if (state == 'main') {
      this.hiddenPickerMain = !this.hiddenPickerMain;
    } else if (state == 'secondary') {
      this.hiddenPickerSecondary = !this.hiddenPickerSecondary;
    } else if (state == 'text') {
      this.hiddenPickerText = !this.hiddenPickerText;
    }
  }

  closePicker(state: string) {

    if (state == 'main') {
      this.hiddenPickerMain = true;
    } else if (state == 'secondary') {
      this.hiddenPickerSecondary = true;
    } else if (state == 'text') {
      this.hiddenPickerText = true;
    }
  }

  // Aggiorna il colore selezionato e nasconde il picker
  changeComplete(event: any, state: string) {

    if (state == 'main') {
      this.selectedMainColor = event.color.hex;
    } else if (state == 'secondary') {
      this.selectedSecondaryColor = event.color.hex;
    } else if (state == 'text') {
      this.selectedTextColor = event.color.hex;
    }
  }

  filterPlayers(team: string) {

    var httpParams: HttpParams = new HttpParams();
    httpParams = httpParams.append('team', team);

    this.http.get<Player[]>('http://localhost:3000/players/players_list/filters', { params: httpParams }).subscribe({
      next: (res: Player[]) => {

        this.teamPlayers = res;
      }
    });
  }

  onReject(file: TuiFileLike | readonly TuiFileLike[]): void {
    this.rejectedFiles$.next(file as TuiFileLike);
  }

  removeFile(): void {
    this.control.setValue(null);
    this.imageSrc = null; // Reset dell'URL dell'immagine
    this.bufferedImg = {};
  }

  clearRejected(): void {
    this.removeFile();
    this.rejectedFiles$.next(null);
    this.bufferedImg = {};
  }

  base64ToBlob(base64: string, contentType: string): Blob {
    // Controlla se la stringa base64 contiene l'intestazione Data URL e rimuovila
    const base64WithoutHeader = base64;

    try {
      // Decodifica la stringa base64 in una stringa di caratteri binari
      const byteChars = window.atob(base64WithoutHeader);
      const byteArrays = [];

      // Dividi la stringa di caratteri binari in pezzi e convertili in byte
      for (let offset = 0, len = byteChars.length; offset < len; offset += 1024) {
        const slice = byteChars.slice(offset, offset + 1024);
        const byteNumbers = new Array(slice.length);

        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      // Crea il Blob dal byte array
      const blob = new Blob(byteArrays, { type: contentType });
      return blob;
    } catch (e) {
      console.error('Errore nella decodifica della stringa base64: ', e);
      throw e; // Rilancia l'errore per permettere al chiamante di gestirlo
    }
  }


  makeRequest(file: File): Observable<File | null> {

    this.bufferedImg = {};

    this.loadingFiles$.next(file);

    // Inizia il timer per simulare una richiesta di rete.
    return timer(1000).pipe(
      map(() => {
        // Se il contenuto del file è presente e è un Blob, leggilo.
        if (file && file instanceof Blob) {
          const reader = new FileReader();

          reader.onload = (e: ProgressEvent<FileReader>) => {
            // Verifica che il risultato sia presente e sia una stringa
            if (e.target?.result && typeof e.target.result === 'string') {
              const base64Data = e.target.result.split(',')[1]; // Ottieni solo la parte base64
              this.imageSrc = e.target.result; // Salva l'intero dataURL se necessario per altre operazioni
              this.changeDetectorRef.detectChanges(); // Aggiorna la vista

              // Ora puoi passare con sicurezza la stringa base64 al tuo metodo base64ToBlob
              this.bufferedImg = this.base64ToBlob(base64Data, 'image/webp');
            }
          };

          reader.readAsDataURL(file);
        } else {
          console.error('Il contenuto del file non è un Blob:', file);
        }
        return file;

      }),
      finalize(() => this.loadingFiles$.next(null))
    );
  }

  updateTeam(teamId: any) {
    const formData = new FormData();

    if (this.bufferedImg) {
      // formData.append('image', this.bufferedImg); // Se `this.bufferedImg` è già un Blob, usalo direttamente
      formData.append('team_logo', new Blob([this.bufferedImg], { type: 'image/jpeg' })); // Solo se `this.bufferedImg` è un ArrayBuffer o un'altra struttura di dati binari
    }


    formData.append('team_name', this.teamInfo.controls['team_name'].value);
    formData.append('captain', this.teamInfo.controls['captain'].value.name);
    formData.append('team_main_color', this.selectedMainColor);
    formData.append('team_secondary_color', this.selectedSecondaryColor);
    formData.append('team_text_color', this.selectedTextColor);
    formData.append('oldTeamName', this.oldTeamName);

    this.teamName = this.teamInfo.controls['team_name'].value;

    // Invia i dati al tuo server
    this.sendDataToServer(formData, teamId);

  }

  sendDataToServer(formData: FormData, id: any) {

    this.http.put(`http://localhost:3000/players/edit-team/${id}`, formData).subscribe({
      error: (error) => {
        console.error('Errore durante il salvataggio dei dati', error);
      },
      complete: () => {
        this.subMenuVoices.requestNavbarUpdate();
        this.observer.complete();
        this.teamDetail.loadDataBasedOnId(this.selectedTeam.team_id);
        this.teamDetail.FilterPlayers('', '', this.teamName);
        this.alerts.open('Team modificato con Successo!!', { label: 'Operazione Effettuata', status: TuiNotification.Success }).subscribe();
      }
    });
  }

}
