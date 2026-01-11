import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MenuS {
  private readonly http = inject(HttpClient);

  private readonly url = `${environment.apiUrl}/Menu`;

  /* ---------------- ADD ---------------- */
  addMenu(model: any): Observable<any> {
    return this.http.post<any>(this.url, model);
  }

  /* ---------------- GET ALL ---------------- */
  getAllMenu(): Observable<any[]> {
    return this.http.post<any[]>(`${this.url}/Search`, {});
  }

  /* ---------------- GET SINGLE ---------------- */
  getMenu(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.url}/${id}`);
  }

  /* ---------------- UPDATE ---------------- */

  updateMenu(id: number | string, updateRequest: any): Observable<any> {
    return this.http.put<any>(`${this.url}/${id}`, updateRequest);
  }

  /* ---------------- DELETE ---------------- */
  deleteMenu(id: number | string): Observable<any> {
    return this.http.delete<any>(`${this.url}/${id}`);
  }

  /* ---------------- TREE DATA ---------------- */
  generateTreeData(userId: number | string): Observable<any> {
    return this.http.get<any>(`${this.url}/GenerateTreeData?userId=${userId}`);
  }
}
