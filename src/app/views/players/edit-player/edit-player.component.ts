import { HttpClient, HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ChangeDetectorRef, OnInit, Input, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TuiAlertService, TuiNotification } from '@taiga-ui/core';
import { TuiFileLike } from '@taiga-ui/kit';
import { Observable, Subject, finalize, map, of, switchMap, timer } from 'rxjs';
import { playerOSV } from 'src/app/components/navbar/common-data';
import { PlayersComponent } from '../players.component';
// import {tuiInputNumberOptionsProvider} from '@taiga-ui/kit';

@Component({
  selector: 'app-edit-player',
  templateUrl: './edit-player.component.html',
  styleUrls: ['./edit-player.component.less']
})
export class EditPlayerComponent implements OnInit {

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, @Inject(TuiAlertService)
  private readonly alerts: TuiAlertService, private players: PlayersComponent) { }

  @Input() playerId: any;
  @Input() observer: any;
  @Input() filteredValue: any;

  overall!: number;
  itemsRoles: Array<string> = [];
  itemsTeams: Array<string> = [];

  imageSrc: string | ArrayBuffer | null = null;

  bufferedImg: any;

  readonly control = new FormControl();

  readonly rejectedFiles$ = new Subject<TuiFileLike | null>();
  readonly loadingFiles$ = new Subject<TuiFileLike | null>();
  readonly loadedFiles$ = this.control.valueChanges.pipe(
    switchMap(file => (file ? this.makeRequest(file) : of(null))),
  );

  player = new FormGroup({
    name: new FormControl('',Validators.required),
    position: new FormControl(null, Validators.required),
    country: new FormControl('',Validators.required),
    goals: new FormControl(),
    assist: new FormControl(),
    motm: new FormControl(),
    yellow_card: new FormControl(),
    red_card: new FormControl(),
    injured: new FormControl(),
    salary: new FormControl(),
    overall: new FormControl('',Validators.required),
    player_value: new FormControl(),
  });

  ngOnInit(): void {

    this.getPlayerInfo(this.playerId);

  }


  getDropDown(type: string) {

    this.http.get(`http://localhost:3000/players/${type}`).subscribe({
      next: (res: any) => {
        if (type == 'roles') {
          this.itemsRoles = res.map((item: any) => item.position);
        } else if (type == 'teams') {
          this.itemsTeams = res.map((item: any) => item.team);
        }
      }
    })
  }

  setPlayerData(res: any) {

    this.player.controls['name'].setValue(res.name);
    this.player.controls['position'].setValue(res.position);
    this.player.controls['country'].setValue(res.country);
    this.player.controls['goals'].setValue(res.goals);
    this.player.controls['assist'].setValue(res.assist);
    this.player.controls['motm'].setValue(res.motm);
    this.player.controls['yellow_card'].setValue(res.yellow_card);
    this.player.controls['red_card'].setValue(res.red_card);
    this.player.controls['injured'].setValue(res.injured);
    this.player.controls['overall'].setValue(res.overall);
    this.updateSalaryAndValue(res.overall);

    if (res.photo) {
      // Converti la stringa base64 in un Blob
      const imageBlob = this.base64ToBlob(res.photo.split(',')[1], 'image/webp');
      const imageName = 'player_photo.webp';
      const imageFile = new File([imageBlob], imageName, { type: 'image/webp' });

      this.control.setValue(imageFile);
      this.imageSrc = res.photo;
    }

  }

  getPlayerInfo(id: any) {

    this.http.get(`http://localhost:3000/players/player/${id}`).subscribe({
      next: (res: any) => {

        this.setPlayerData(res);

      }
    })
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
              this.cdr.detectChanges(); // Aggiorna la vista

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

  updateSalaryAndValue(overall: number) {

    let playerData: any;

    if (!overall || overall <= 0) {

      this.player.controls['salary'].disable();
      this.player.controls['player_value'].disable();
      return;
    }

    if (overall <= 79) {
      // Assign values corresponding to overall 79
      playerData = playerOSV.find(p => p.overall == 79);
    } else {
      // Find the matching overall value in the array
      playerData = playerOSV.find(p => p.overall == overall);
    }

    if (playerData) {

      this.player.controls['salary'].setValue(playerData.salary);
      this.player.controls['player_value'].setValue(playerData.player_value);
    } else {

      this.player.controls['salary'].reset();
      this.player.controls['player_value'].reset();
    }

    this.player.controls['salary'].disable();
    this.player.controls['player_value'].disable();
  }

  update(id: any) {

    if (this.player.invalid) {

      this.player.markAllAsTouched();
      this.cdr.detectChanges();
      this.alerts.open('I Campi Indicati con <b>*</b> risultano vuoti o non conformi.', { label: 'Errore compilazione Form!', status: TuiNotification.Error }).subscribe();

      return;
      
    } else {

    const formData = new FormData();

    // Aggiungi i dati del form al FormData
    Object.entries(this.player.value).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (this.bufferedImg) {
      // formData.append('image', this.bufferedImg); // Se `this.bufferedImg` è già un Blob, usalo direttamente
      formData.append('photo', new Blob([this.bufferedImg], { type: 'image/jpeg' })); // Solo se `this.bufferedImg` è un ArrayBuffer o un'altra struttura di dati binari
    }

    formData.append('salary', this.player.controls['salary'].value);
    formData.append('player_value', this.player.controls['player_value'].value);

    // Invia i dati al tuo server
    this.sendDataToServer(formData, id);

  }

  }

  sendDataToServer(formData: FormData, id: any) {

    this.http.put(`http://localhost:3000/players/edit-player/${id}`, formData).subscribe({
      error: (error) => {
        console.error('Errore durante il salvataggio dei dati', error);
        // Gestisci l'errore qui
      },
      complete: () => {
        this.observer.complete();
        this.players.FilterPlayers(this.filteredValue[0], this.filteredValue[1], this.filteredValue[2]);
        this.alerts.open('Info Calciatore aggiornate con Successo!!', { label: 'Operazione Effettuata', status: TuiNotification.Success }).subscribe();
        this.updateTeamSalaryAndValue();
      }
    });
  }

  updateTeamSalaryAndValue() {

    this.http.put(`http://localhost:3000/players/team-detail/update-value-salary`, undefined).subscribe({
      error: (err: any) => {
        console.error(err);
      },
    });

  }

}

