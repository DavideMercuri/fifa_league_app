import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TuiFileLike } from '@taiga-ui/kit';
import { Observable, Subject, finalize, map, of, switchMap, timer } from 'rxjs';
import { playerOSV } from 'src/app/components/navbar/common-data';
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

  constructor(private http: HttpClient) { }

  overall!: number;
  itemsRoles: Array<string> = [];
  itemsTeams: Array<string> = [];

  newPlayer = new FormGroup({
    name: new FormControl(),
    position: new FormControl(),
    country: new FormControl(),
    overall: new FormControl(),
    price: new FormControl({ disabled: true }),
    salary: new FormControl({ disabled: true }),
    team: new FormControl(),
    goal: new FormControl(0),
    assist: new FormControl(0),
    motm: new FormControl(0),
    photo: new FormControl(''),
    yellowCard: new FormControl(0),
    redCard: new FormControl(0),
    injured: new FormControl(0),
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

  imageSrc: string | ArrayBuffer | null = null;

  readonly control = new FormControl();

  readonly rejectedFiles$ = new Subject<TuiFileLike | null>();
  readonly loadingFiles$ = new Subject<TuiFileLike | null>();
  readonly loadedFiles$ = this.control.valueChanges.pipe(
    switchMap(file => (file ? this.makeRequest(file) : of(null))),
  );

  onReject(file: TuiFileLike | readonly TuiFileLike[]): void {
    this.rejectedFiles$.next(file as TuiFileLike);
  }

  removeFile(): void {
    this.control.setValue(null);
    this.imageSrc = null; // Reset dell'URL dell'immagine
  }

  clearRejected(): void {
    this.removeFile();
    this.rejectedFiles$.next(null);
  }

  makeRequest(file: File): Observable<File | null> {
    this.loadingFiles$.next(file);

    // Inizia il timer per simulare una richiesta di rete.
    return timer(1000).pipe(
      map(() => {
        // Simula una risposta di successo o di errore.
        if (Math.random() > 0.5) {
          // Se il contenuto del file è presente e è un Blob, leggilo.
          if (file && file instanceof Blob) {
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
              // Assicurati che il risultato non sia undefined prima di assegnarlo a imageSrc.
              if (e.target?.result) {
                this.imageSrc = e.target.result as string;
              }
            };
            reader.readAsDataURL(file);
          } else {
            console.error('Il contenuto del file non è un Blob:', file);
          }
          return file;
        }
        this.rejectedFiles$.next(file);
        return null;
      }),
      finalize(() => this.loadingFiles$.next(null))
    );
  }


  readFile(file: TuiFileLike): void {
    if (file.content instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target && e.target.result !== undefined) {
          this.imageSrc = e.target.result;
        }
      };
      reader.readAsDataURL(file.content);
    } else {
      // Gestisci il caso in cui content non è un Blob
      console.error('Il file selezionato non è un Blob.');
    }
  }

  updateSalaryAndValue(overall: number) {

    let playerData: any;

    if (!overall || overall <= 0) {

      this.newPlayer.controls['salary'].reset();
      this.newPlayer.controls['price'].reset();

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
      this.newPlayer.controls['price'].setValue(playerData.player_value);
    } else {
      // Handle the case where overall doesn't match any entry
      this.newPlayer.controls['salary'].reset();
      this.newPlayer.controls['price'].reset();
    }

    this.newPlayer.controls['salary'].disable();
    this.newPlayer.controls['price'].disable();
  }

}
