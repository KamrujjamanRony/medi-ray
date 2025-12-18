import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);

  private apiCall<T>(endpoint: string, method: 'get' | 'post' | 'put' | 'delete', body?: any): Observable<T> {
    const url = `${environment.apiUrl}/User${endpoint}`;
    return this.http.request<T>(method, url, { body, withCredentials: true });
  }

  addUser(model: any): Observable<void> {
    return this.apiCall<void>('', 'post', model);
  }

  getUser(query: string): Observable<any> {
    return this.apiCall<any>(`/Search`, 'post', {});
  }

  updateUser(id: string | number, updateUserRequest: any): Observable<any> {
    const req = {
      ...updateUserRequest,
      userId: id
    }
    return this.apiCall<any>(`/EditUser/${id}?userId=${id}`, 'put', req);
  }

  deleteUser(id: string | number): Observable<any> {
    return this.apiCall<any>(`/DeleteUser?id=${id}`, 'delete');
  }
}
