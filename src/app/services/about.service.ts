import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { About } from '../store/about.slice';

@Injectable({
  providedIn: 'root'
})
export class AboutService {
  http = inject(HttpClient);
  url = `${environment.apiUrl}/AboutUs`;


  getAllAbout(): Observable<About[]> {
    return this.http.get<About[]>(this.url);
  }


  getCompanyAbout(companyID: number): Observable<About | undefined> {
    return this.getAllAbout().pipe(
      map(allAbout => allAbout.find(about => about.companyID === companyID))
    );
  }

  getAbout(id: any): Observable<About> {
    return this.http.get<About>(`${this.url}/GetAboutUsById?id=${id}`);
  }

  updateAbout(id: string, updateAboutRequest: About | FormData): Observable<About> {
    return this.http.put<About>(`${this.url}/EditAboutUs/${id}`, updateAboutRequest);
  }
}
