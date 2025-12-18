import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = signal<any>(null);

  constructor(private http: HttpClient) {}

  loadUser() {
    return this.http.get('/api/me', { withCredentials: true }).pipe(
      tap(user => this.user.set(user)),
      catchError(() => {
        this.user.set(null);
        return of(null);
      })
    );
  }

  login(data: any) {
    return this.http.post('/api/login', data, {
      withCredentials: true,
    });
  }

  logout() {
    return this.http.post('/api/logout', {}, { withCredentials: true }).pipe(
      tap(() => this.user.set(null))
    );
  }

  isLoggedIn() {
    return !!this.user();
  }
}
