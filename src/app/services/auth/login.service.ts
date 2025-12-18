import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private readonly http = inject(HttpClient);

  login(data: any) {
    return this.http.post(`${environment.apiUrl}/Authentication/Login`, data);
  }
}
