import { HttpClient, HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ChangeDetectorRef, OnInit, Input, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TuiAlertService, TuiNotification } from '@taiga-ui/core';
import { TuiFileLike } from '@taiga-ui/kit';
import { Observable, Subject, finalize, map, of, switchMap, timer } from 'rxjs';
import { playerOSV } from 'src/app/components/navbar/common-data';
import { PlayersComponent } from '../players.component';
import { Transaction } from 'src/interfaces/transaction.interface';
// import {tuiInputNumberOptionsProvider} from '@taiga-ui/kit';

@Component({
  selector: 'app-insert-player',
  templateUrl: './insert-player.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // providers: [
  //   tuiInputNumberOptionsProvider({
  //     decimal: 'never',
  //     step: 1,
  //   }),
  // ],
})
export class InsertPlayerComponent {

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, @Inject(TuiAlertService)
  private readonly alerts: TuiAlertService, private players: PlayersComponent) { }

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

  newPlayer = new FormGroup({
    name: new FormControl(),
    position: new FormControl(),
    country: new FormControl(),
    team: new FormControl('Svincolati'),
    goals: new FormControl(0),
    assist: new FormControl(0),
    motm: new FormControl(0),
    yellow_card: new FormControl(0),
    red_card: new FormControl(0),
    injured: new FormControl(0),
    salary: new FormControl(),
    overall: new FormControl(),
    player_value: new FormControl(),
  });

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

      this.newPlayer.controls['salary'].reset();
      this.newPlayer.controls['player_value'].reset();
      this.newPlayer.controls['salary'].disable();
      this.newPlayer.controls['player_value'].disable();
      return;
    }

    if (overall <= 79) {
      // Assign values corresponding to overall 79
      playerData = playerOSV.find(p => p.overall === 79);
    } else {
      // Find the matching overall value in the array
      playerData = playerOSV.find(p => p.overall === overall);
    }

    if (playerData) {
      this.newPlayer.controls['salary'].setValue(playerData.salary);
      this.newPlayer.controls['player_value'].setValue(playerData.player_value);
    } else {
      // Handle the case where overall doesn't match any entry
      this.newPlayer.controls['salary'].reset();
      this.newPlayer.controls['player_value'].reset();
    }

    this.newPlayer.controls['salary'].disable();
    this.newPlayer.controls['player_value'].disable();
  }

  moneyUpdateOnPlayerInsert(res: any, team_name: any) {

    var sum = res.money - this.newPlayer.controls['player_value'].value;
    var id = res.team_id;
    var payment = true;

    const body = { id, sum, payment };

    this.http.put(`http://localhost:3000/players/team_detail/update-team-money`, body).subscribe({
      error: (err: any) => {
        console.error(err);
      },
    });
  }


  loadDataBasedOnTeamName(team_name: any, transaction: any): void {

    var httpParams: HttpParams = new HttpParams().append('team_name', team_name);
    this.http.get(`http://localhost:3000/players/team-detail`, { params: httpParams }).subscribe({
      next: (res: any) => {
        transaction.updated_team_money = res[0].money - this.newPlayer.controls['player_value'].value;
        this.registerTransaction(String(transaction.transaction_team), transaction);
        this.moneyUpdateOnPlayerInsert(res[0], team_name);
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

  insert() {

    const formData = new FormData();

    // Aggiungi i dati del form al FormData
    Object.entries(this.newPlayer.value).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (this.bufferedImg) {
      // formData.append('image', this.bufferedImg); // Se `this.bufferedImg` è già un Blob, usalo direttamente
      formData.append('photo', new Blob([this.bufferedImg], { type: 'image/jpeg' })); // Solo se `this.bufferedImg` è un ArrayBuffer o un'altra struttura di dati binari
    }

    formData.append('salary', this.newPlayer.controls['salary'].value);
    formData.append('player_value', this.newPlayer.controls['player_value'].value);

    // Invia i dati al tuo server
    this.sendDataToServer(formData);
  }

  sendDataToServer(formData: FormData) {

    var teamSelected: any = this.newPlayer.controls['team'].value;
    var transaction: Transaction;

    this.http.post('http://localhost:3000/players/insert-new-player', formData).subscribe({
      next: () => {
        transaction = {
          transaction_mode: 'DEBIT',
          transaction_amount: this.newPlayer.controls['player_value'].value,
          transaction_date: new Date().toString(),
          transaction_team: String(this.newPlayer.controls['team'].value),
          transaction_detail: {
            type: 'player_sign',
            player_name: this.newPlayer.controls['name'].value,
            buyer: String(this.newPlayer.controls['team'].value),
          },
        }
      },
      error: (error) => {
        console.error('Errore durante il salvataggio dei dati', error);
      },
      complete: () => {
        if (teamSelected != 'Svincolati') {

          this.loadDataBasedOnTeamName(teamSelected, transaction);
        }
        this.observer.complete();
        this.players.FilterPlayers(this.filteredValue[0], this.filteredValue[1], this.filteredValue[2]);
        this.alerts.open('Calciatore aggiunto con Successo!!', { label: 'Operazione Effettuata', status: TuiNotification.Success }).subscribe();
      }
    });
  }

  registerTransaction(transaction_team: string, transaction: Transaction) {

    const teamName = transaction_team;

    // Invia la transazione al server. Assicurati che il server accetti il nome del team anziché l'ID del team.
    this.http.post('http://localhost:3000/players/register-transaction', { teamName, transaction: transaction }).subscribe({
      next: (response) => {
        console.log('Transaction registered successfully', response);
      },
      error: (error) => {
        console.error('Error registering transaction', error);
      }
    });
  }

}
