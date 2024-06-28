import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DataService } from 'src/app/data.service';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { FormControl } from '@angular/forms';
import { Fixture } from 'src/interfaces/fixture.interfaces';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

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
  lastMatch!: Fixture;
  transactions: any;

  tdStyleClass: string = 'tui-table__td tui-table__td_text_center team tui-table__td_first tui-table__td_last';
  trStyleClass: string = 'tui-table__tr tui-table__tr_border_none tui-table__tr_hover_disabled';
  tableStyleClass: string = 'tui-table tui-table__tr_hover_disabled tui-table_font-size_s';
  fixturesButtonStyleClass: string = 'action tui-table col-4 button-fixture';

  index = 0;
  indexStats = 0;
  indexTransactions = 0;

  leagueNumber: FormControl = new FormControl();
  year: FormControl = new FormControl();

  teams: any;

  readonly columns = ['tipo', 'importo', 'data', 'causale', 'saldo'];

  faMagnifyingGlass = faMagnifyingGlass;

  @ViewChild('carousel') carousel: any;

  ngOnInit(): void {

    this.http.get('http://localhost:3000/players/league_table').subscribe({
      next: (res) => {
        this.teams = res;
      }
    });

    setTimeout(() => {
      this.getLastAvalaibleMatch();
      this.getTopPlayersInfo('goals');
      this.getTopPlayersInfo('assist');
      this.getTopPlayersInfo('motm');
      this.GetPlayers();
      this.getTransactions();
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

  getTransactions() {
    this.http.get(`http://localhost:3000/players/transactions`).subscribe({
      next: (res: any) => {

        this.transactions = this.convertJsonStrings(res);

        console.log(this.transactions);
        
        

      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }


  convertJsonStrings(array: any[]): any[] {
    let transactions: any[] = [];

    array.forEach((item, index) => {
      if (item && item.team_transactions && item.team_name) {
        try {
          console.log(`Processing item at index ${index}`);
          const parsedJsonArray = JSON.parse(item.team_transactions);
          if (Array.isArray(parsedJsonArray)) {
            // Prendi solo gli ultimi 5 risultati (o meno)
            const lastFiveTransactions = parsedJsonArray.slice(-6);
            transactions.push({
              team_name: item.team_name,
              transactions: lastFiveTransactions
            });
          } else {
            console.warn(`Parsed JSON is not an array at index ${index}`);
            transactions.push({
              team_name: item.team_name,
              transactions: []
            });
          }
        } catch (e) {
          console.error('Error parsing JSON at index', index, ':', e);
          transactions.push({
            team_name: item.team_name,
            transactions: []
          });
        }
      } else {
        console.warn(`Invalid item at index ${index}`, item);
        transactions.push({
          team_name: item.team_name || 'Unknown Team',
          transactions: []
        });
      }
    });

    return transactions;
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

  getLastAvalaibleMatch() {

    this.http.get(`http://localhost:3000/players/fixtures/get-last-avalaible-match`).subscribe({
      next: (res: any) => {
        this.lastMatch = res[0];
      }
    })
  }

  teamLogo(array: any, teamName: string) {
    if (array) {
      const teamObj = array.find((obj: any) => obj.team === teamName);
      return teamObj ? teamObj.team_logo : 'No logo found for this team';
    } else {
      setTimeout(() => {
        this.teamLogo(array, teamName);
      }, 100)
    }

  }

}