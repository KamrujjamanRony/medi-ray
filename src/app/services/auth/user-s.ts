import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserS {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/User`;

  /* ---------------- ADD ---------------- */
  addUser(model: any): Observable<any> {
    return this.http.post<any>(this.url, model, { withCredentials: true });
  }

  /* ---------------- GET ALL / SEARCH ---------------- */
  getUser(query: any): Observable<any[]> {
    return this.http.post<any[]>(`${this.url}/Search`, query, { withCredentials: true });
  }

  /* ---------------- GET SINGLE ---------------- */
  getUserById(id: string | number): Observable<any> {
    return this.http.get<any>(`${this.url}/${id}`, { withCredentials: true });
  }

  /* ---------------- UPDATE ---------------- */
  updateUser(id: string | number, updateUserRequest: any): Observable<any> {
    const req = {
      ...updateUserRequest,
      userId: id
    };
    return this.http.put<any>(`${this.url}/${id}?userId=${id}`, req, { withCredentials: true });
  }

  /* ---------------- DELETE ---------------- */
  deleteUser(id: string | number): Observable<any> {
    return this.http.delete<any>(`${this.url}/${id}`, { withCredentials: true });
  }
}
