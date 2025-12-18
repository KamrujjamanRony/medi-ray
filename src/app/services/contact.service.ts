import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContactM } from '../utils/models';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  http = inject(HttpClient);
  url = `${environment.apiUrl}/Address`;


  getAllContact(): Observable<ContactM[]> {
    return this.http.get<ContactM[]>(this.url);
  }


  getCompanyContact(companyID: number): Observable<ContactM | undefined> {
    return this.getAllContact().pipe(
      map(allContact => allContact.find(contact => contact.companyID === companyID))
    );
  }

  getContact(id: string): Observable<ContactM> {
    return this.http.get<ContactM>(`${this.url}/GetAddressById?id=${id}`);
  }

  updateContact(id: string, updateAddressRequest: ContactM | FormData): Observable<ContactM> {
    return this.http.put<ContactM>(`${this.url}/EditAddress/${id}`, updateAddressRequest);
  }
}
