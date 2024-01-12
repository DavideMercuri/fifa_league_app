import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Inject } from '@angular/core';
import { DataService } from 'src/app/data.service';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { FormControl } from '@angular/forms';

Chart.register(...registerables);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, AfterViewInit {

  constructor(private http: HttpClient, private dataService: DataService, private cd: ChangeDetectorRef) { }

  items!: Array<any>;

  activeTeams: Array<string> = [];
  homeWins: Array<number> = [];
  awayWins: Array<number> = [];
  homeDraws: Array<number> = [];
  awayDraws: Array<number> = [];
  homeLosses: Array<number> = [];
  awayLosses: Array<number> = [];
  topPlayersList: any = [];

  index = 0;
  indexStats = 0;

  leagueNumber: FormControl = new FormControl();
  year: FormControl = new FormControl();

  @ViewChild('carousel') carousel: any;

  ngOnInit(): void {

    setTimeout(() => {
      this.getTopPlayersInfo('goals');
      this.getTopPlayersInfo('assist');
      this.getTopPlayersInfo('motm');
      this.GetPlayers();
    }, 0);
  }

  ngAfterViewInit(): void {

    this.GetResults('getWins');
    this.GetResults('getDraws');
    this.GetResults('getLosses');

    this.createChart();

  }

  getTopPlayersInfo(category: string): void {
    this.http.get(`http://localhost:3000/players/players_list/top_players?category=${category}`).subscribe({
      next: (res: any) => {

        switch (category) {
          case 'goals':
            this.topPlayersList.push({ ...res[0], ...{ label: 'Miglior Marcatore', subLabel: `Goal in Campionato`, stat: res[0].goals } });
            break;
          case 'assist':
            this.topPlayersList.push({ ...res[0], ...{ label: 'Miglior Assistman', subLabel: `Assist in Campionato`, stat: res[0].assist } });
            break;
          case 'motm':
            this.topPlayersList.push({ ...res[0], ...{ label: 'Miglior Motm', subLabel: `volte Migliore in Campo`, stat: res[0].motm } });
            break;
        }
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  GetPlayers() {
    this.http.get('http://localhost:3000/players/players_list').subscribe({
      next: (res: any) => {
        this.dataService.setPlayersList(res);
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  GetResults(type?: string) {

    this.http.get(`http://localhost:3000/players/${type}`).subscribe({
      next: (res: any) => {
        res.map((item: any) => {
          switch (type) {
            case 'getWins':
              this.activeTeams.push(item.team);
              this.homeWins.push(item.total_home_wins);
              this.awayWins.push(item.total_away_wins);
              this.dataService.setWinsStats({ home: this.homeWins, away: this.awayWins });
              break;
            case 'getDraws':
              this.homeDraws.push(item.total_home_draws);
              this.awayDraws.push(item.total_away_draws);
              this.dataService.setDrawsStats({ home: this.homeDraws, away: this.awayDraws });
              break;
            case 'getLosses':
              this.homeLosses.push(item.total_home_losses);
              this.awayLosses.push(item.total_away_losses);
              this.dataService.setLossesStats({ home: this.homeLosses, away: this.awayLosses });
              break;
          }
        });
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  SetMaxValue(homeStat: any, awayStat: any): number {

    var maxValue = Math.max(...this.activeTeams.map((activeTeams, index) => homeStat[index] + awayStat[index]));

    return maxValue;

  }

  createChart() {
    if (this.dataService && this.dataService.getWinsStats() && this.dataService.getDrawsStats() && this.dataService.getLossesStats()) {

      new Chart('winsChart', {
        type: 'bar',
        data: {
          labels: this.activeTeams,
          datasets: [
            {
              label: 'Vittorie in Casa',
              data: this.dataService.getWinsStats().home,
              backgroundColor: '#00a768',
              stack: 'Stack 0',
              barPercentage: 0.4,
            },
            {
              label: 'Vittorie in Trasferta',
              data: this.dataService.getWinsStats().away,
              backgroundColor: '#9bdbc3',
              stack: 'Stack 0',
              barPercentage: 0.4,
            },
          ],
        },
        options: {
          scales: {
            x: { beginAtZero: true, },
            y: {
              beginAtZero: true,
              max: this.SetMaxValue(this.dataService.getWinsStats().home, this.dataService.getWinsStats().away) + 2,
              ticks: {
                stepSize: 1, // Usa solo numeri interi
              },
            }
          },
          plugins: {
            datalabels: {
              align: 'top',
              anchor: 'end',
              formatter: (value, context) => {
                const dataSetArray: any = [];
                context.chart.data.datasets.forEach((dataset: any) => {
                  if (dataset.data[context.dataIndex] != undefined) {
                    dataSetArray.push(dataset.data[context.dataIndex]);
                  }
                });
                function totalSum(total: any, datapoint: any) { return total + datapoint; }
                let sum = dataSetArray.reduce(totalSum, 0)
                if (context.datasetIndex === dataSetArray.length - 1) {
                  return sum;
                } else {
                  return '';
                }
              },
            },
          },
        },
        plugins: [ChartDataLabels]
      });

      new Chart('drawsChart', {
        type: 'bar',
        data: {
          labels: this.activeTeams,
          datasets: [
            {
              label: 'Pareggi in Casa',
              data: this.dataService.getDrawsStats().home,
              backgroundColor: '#ffe300',
              stack: 'Stack 0',
              barPercentage: 0.4,
            },
            {
              label: 'Pareggi in Trasferta',
              data: this.dataService.getDrawsStats().away,
              backgroundColor: '#efcd00',
              stack: 'Stack 0',
              barPercentage: 0.4,
            },
          ]
        },
        options: {
          scales: {
            x: { beginAtZero: true, },
            y: {
              beginAtZero: true,
              max: this.SetMaxValue(this.dataService.getDrawsStats().home, this.dataService.getDrawsStats().away) + 2,
              ticks: {
                stepSize: 1, // Usa solo numeri interi
              },
            }
          },
          plugins: {
            datalabels: {
              align: 'top',
              anchor: 'end',
              formatter: (value, context) => {
                const dataSetArray: any = [];
                context.chart.data.datasets.forEach((dataset: any) => {
                  if (dataset.data[context.dataIndex] != undefined) {
                    dataSetArray.push(dataset.data[context.dataIndex]);
                  }
                });
                function totalSum(total: any, datapoint: any) { return total + datapoint; }
                let sum = dataSetArray.reduce(totalSum, 0)
                if (context.datasetIndex === dataSetArray.length - 1) {
                  return sum;
                } else {
                  return '';
                }
              },
            },
          },
        },
        plugins: [ChartDataLabels]
      });

      new Chart('lossesChart', {
        type: 'bar',
        data: {
          labels: this.activeTeams,
          datasets: [
            {
              label: 'Sconfitte in Casa',
              data: this.dataService.getLossesStats().home,
              backgroundColor: '#cf0000',
              stack: 'Stack 0',
              barPercentage: 0.4,
            },
            {
              label: 'Sconfitte in Trasferta',
              data: this.dataService.getLossesStats().away,
              backgroundColor: '#940000',
              stack: 'Stack 0',
              barPercentage: 0.4,
            },
          ],
        },
        options: {
          scales: {
            x: { beginAtZero: true, },
            y: {
              beginAtZero: true,
              max: this.SetMaxValue(this.dataService.getLossesStats().home, this.dataService.getLossesStats().away) + 2,
              ticks: {
                stepSize: 1, // Usa solo numeri interi
              },
            }
          },
          plugins: {
            datalabels: {
              align: 'top',
              anchor: 'end',
              formatter: (value, context) => {
                const dataSetArray: any = [];
                context.chart.data.datasets.forEach((dataset: any) => {
                  if (dataset.data[context.dataIndex] != undefined) {
                    dataSetArray.push(dataset.data[context.dataIndex]);
                  }
                });
                function totalSum(total: any, datapoint: any) { return total + datapoint; }
                let sum = dataSetArray.reduce(totalSum, 0)
                if (context.datasetIndex === dataSetArray.length - 1) {
                  return sum;
                } else {
                  return '';
                }
              },
            },
          },
        },
        plugins: [ChartDataLabels]
      });
      this.cd.detectChanges();
    } else {
      setTimeout(() => {
        this.createChart()
      }, 500)
    }
    this.cd.detectChanges();
  }

  resetLeague() {
    this.http.put('http://localhost:3000/reset-league', undefined).subscribe({
      error: (err: any) => {
        console.error(err);
      },
      complete: () => {
        //console.log('Reset Completato');
      }
    })
  }

  startNewLeague() {
    this.http.post('http://localhost:3000/start-new-season', undefined).subscribe({
      error: (err: any) => {
        console.error(err);
      },
      complete: () => {
        //console.log('Fatto');
      }
    })
  }

}