import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AboutS {
  http = inject(HttpClient);
  url = `${environment.apiUrl}/AboutUs`;
  
  getAbout(id: any = environment.companyCode): Observable<any> {
    return this.http.get(`${this.url}/${id}`);
  }

  updateAbout(id: any, updateAboutRequest: any): Observable<any> {
    return this.http.put(`${this.url}/${id}`, updateAboutRequest);
  }  
}
