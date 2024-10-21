import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      this.isAuthenticated = true;
    }
  }

  private apiURL = 'http://localhost:3000/login';
  private TOKEN_KEY = 'jwt_token';
  isAuthenticated = false;

  login(username: string, password: string): Observable<any> {
    return this.http.post(this.apiURL, { username, password }).pipe(
      tap((response: any) => {
        if (response.success && response.token) {
          localStorage.setItem('jwt_token', response.token);
        }
      })
    );
  }

  // Save token in localStorage
  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Delete token from localStorage
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  logout(): void {
    this.removeToken();
    this.isAuthenticated = false;
  }

  //check if user is logged in
  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  setAuthenticationStatus(status: boolean): void {
    this.isAuthenticated = status;
  }
}