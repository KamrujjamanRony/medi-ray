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
        const url = `${environment.apiUrl}/Menu${endpoint}`;
        return this.http.request<T>(method, url, { body });
  }

  addMenu(model: any): Observable<any> {
    return this.apiCall<any>('', 'post', model);
  }

  getAllMenu(): Observable<any> {
    return this.apiCall<any>('/Search', 'post', {});
  }

  getMenu(id: any): Observable<any> {
    return this.apiCall<any>(`/${id}`, 'post');
  }

  updateMenu(id: any, updateRequest: any): Observable<any> {
    return this.apiCall<any>(`/${id}`, 'put', updateRequest);
  }

  deleteMenu(id: any): Observable<any> {
    return this.apiCall<any>(`/${id}`, 'delete', {});
  }

  generateTreeData(id: any): Observable<any> {
    return this.apiCall<any>(`/GenerateTreeData?userId=${id}`, 'get');
  }
}
