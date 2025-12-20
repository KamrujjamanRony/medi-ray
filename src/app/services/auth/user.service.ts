import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { from, lastValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProductM } from '../../utils/models';
import { SimpleCacheService } from '../simple-cache.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
    cache = inject(SimpleCacheService);
  url = `${environment.apiUrl}/User`;

  private apiCall<T>(endpoint: string, method: 'get' | 'post' | 'put' | 'delete', body?: any): Observable<T> {
    const url = `${environment.apiUrl}/User${endpoint}`;
    return this.http.request<T>(method, url, { body, withCredentials: true });
  }

  addUser(model: any): Observable<void> {
    return this.apiCall<void>('', 'post', model);
  }

  getUser(query: any): Observable<any> {
    return this.http.post<any[]>(this.url + "/Search",query);
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
