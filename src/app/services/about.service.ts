import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AboutM } from '../utils/models';

@Injectable({
  providedIn: 'root'
})
export class AboutService {
  http = inject(HttpClient);
  url = `${environment.apiUrl}/AboutUs`;


  getAllAbout(): Observable<AboutM[]> {
    return this.http.get<AboutM[]>(this.url);
  }


  getCompanyAbout(companyID: number): Observable<AboutM | undefined> {
    return this.getAllAbout().pipe(
      map(allAbout => allAbout.find(about => about.companyID === companyID))
    );
  }

  getAbout(id: any): Observable<AboutM> {
    return this.http.get<AboutM>(`${this.url}/GetAboutUsById?id=${id}`);
  }

  updateAbout(id: string, updateAboutRequest: AboutM | FormData): Observable<AboutM> {
    return this.http.put<AboutM>(`${this.url}/EditAboutUs/${id}`, updateAboutRequest);
  }
}
