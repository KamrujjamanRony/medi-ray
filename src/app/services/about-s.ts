import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { from, lastValueFrom, Observable } from 'rxjs';
import { AboutM } from '../utils/models';
import { CacheS } from './cache-s';

@Injectable({
  providedIn: 'root',
})
export class AboutS {
  http = inject(HttpClient);
  cache = inject(CacheS);
  url = `${environment.apiUrl}/AboutUs`;

  // Cached version
  // getAllAbout(): Observable<AboutM[]> {
  //   return from(
  //     this.cache.getOrSet(
  //       'about_all',
  //       () => lastValueFrom(this.http.get<AboutM[]>(this.url)),
  //       5
  //     )
  //   );
  // }

  // Cached version
  // getCompanyAbout(companyID: number): Observable<AboutM | undefined> {
  //   return from(
  //     this.cache.getOrSet(
  //       `about_company_${companyID}`,
  //       async () => {
  //         const allAbout = await lastValueFrom(this.http.get<AboutM[]>(this.url));
  //         return allAbout.find(about => about.companyID === companyID);
  //       },
  //       5
  //     )
  //   );
  // }

  // Cached version
  getAbout(id: any = environment.companyCode): Observable<AboutM> {
    return from(
      this.cache.getOrSet(
        `about_item_${id}`,
        () => lastValueFrom(this.http.get<AboutM>(`${this.url}/${id}`)),
        10
      )
    );
  }

  // Clear cache on update
  updateAbout(id: string, updateAboutRequest: AboutM | FormData): Observable<AboutM> {
    // Clear relevant cache entries
    this.cache.clear('about_all');
    
    // Extract companyID from the data if it's AboutM
    if (!(updateAboutRequest instanceof FormData)) {
      this.cache.clear(`about_company_${updateAboutRequest.companyID}`);
    }
    
    this.cache.clear(`about_item_${id}`);
    
    return this.http.put<AboutM>(`${this.url}/${id}`, updateAboutRequest);
  }

  // Optional: Manual refresh
  refreshAbout(): void {
    this.cache.clearByPattern(/^cache_about_/);
  }
  
}
