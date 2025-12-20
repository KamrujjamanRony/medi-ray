import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SimpleCacheService } from './simple-cache.service';
import { environment } from '../../environments/environment';
import { from, lastValueFrom, Observable } from 'rxjs';
import { ContactM } from '../utils/models';

@Injectable({
  providedIn: 'root',
})
export class ContactS {
  http = inject(HttpClient);
  cache = inject(SimpleCacheService);
  url = `${environment.apiUrl}/Address`;

  // Cached version
  getAllContact(): Observable<ContactM[]> {
    return from(
      this.cache.getOrSet(
        'contact_all',
        () => lastValueFrom(this.http.get<ContactM[]>(this.url)),
        5
      )
    );
  }

  // Cached version
  getCompanyContact(companyID: number): Observable<ContactM | undefined> {
    return from(
      this.cache.getOrSet(
        `contact_company_${companyID}`,
        async () => {
          const allContact = await lastValueFrom(this.http.get<ContactM[]>(this.url));
          return allContact.find(contact => contact.companyID === companyID);
        },
        5
      )
    );
  }

  // Cached version
  getContact(id: number): Observable<ContactM> {
    return from(
      this.cache.getOrSet(
        `contact_item_${id}`,
        () => lastValueFrom(this.http.get<ContactM>(`${this.url}/${id}`)),
        10
      )
    );
  }

  // Clear cache on update
  updateContact(id: string, updateAddressRequest: ContactM | FormData): Observable<ContactM> {
    // Clear relevant cache entries
    this.cache.clear('contact_all');
    
    // Extract companyID from the data if it's ContactM
    if (!(updateAddressRequest instanceof FormData)) {
      this.cache.clear(`contact_company_${updateAddressRequest.companyID}`);
    }
    
    this.cache.clear(`contact_item_${id}`);
    
    return this.http.put<ContactM>(`${this.url}/EditAddress/${id}`, updateAddressRequest);
  }

  // Optional: Manual refresh
  refreshContact(): void {
    this.cache.clearByPattern(/^cache_contact_/);
  }
  
}
