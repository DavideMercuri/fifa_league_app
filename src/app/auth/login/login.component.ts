import { TuiAlertService, TuiNotification } from '@taiga-ui/core';
import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {

  readonly username = new FormControl('');
  readonly password = new FormControl('');

  errorMessage!: string;

  constructor(private authService: AuthService, private router: Router, @Inject(TuiAlertService)
  private readonly alerts: TuiAlertService) { }

  login(): void {
    if (!this.username.value || !this.password.value) {
      return;
    } else {
      this.authService.login(this.username.value, this.password.value).subscribe(response => {
        if (response.token) {
          this.authService.saveToken(response.token);  // Save token
          this.authService.setAuthenticationStatus(true);
          this.router.navigate(['/home']);
        } else {
          this.errorMessage = response.message || 'Errore durante il login.';
          this.authService.setAuthenticationStatus(false);
          this.alerts
            .open(this.errorMessage, { label: 'Errore', status: TuiNotification.Error })
            .subscribe();
        }
      });
    }
  }


}
