import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private readonly http = inject(HttpClient);

  private apiCall<T>(endpoint: string, method: 'get' | 'post' | 'put' | 'delete', body?: any): Observable<T> {
        const url = `${environment.apiUrl}/api/Menu${endpoint}`;
        return this.http.request<T>(method, url, { body });
  }

  addMenu(model: any): Observable<any> {
    return this.apiCall<any>('', 'post', model);
  }

  getAllMenu(): Observable<any> {
    return this.apiCall<any>('/SearchMenu', 'post', {});
  }

  getMenu(id: any): Observable<any> {
    return this.apiCall<any>(`/GetById/${id}`, 'post');
  }

  updateMenu(id: any, updateRequest: any): Observable<any> {
    return this.apiCall<any>(`/EditMenu/${id}`, 'put', updateRequest);
  }

  deleteMenu(id: any): Observable<any> {
    return this.apiCall<any>(`/DeleteMenu?id=${id}`, 'delete', {});
  }

  generateTreeData(userId: any = ''): Observable<any> {
    return this.apiCall<any>(`/GenerateTreeData?userId=${userId}`, 'get');
  }
}
