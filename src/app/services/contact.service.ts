import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Contact } from '../store/contact.slice';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  http = inject(HttpClient);
  url = `${environment.apiUrl}/Address`;


  getAllContact(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.url);
  }


  getCompanyContact(companyID: number): Observable<Contact | undefined> {
    return this.getAllContact().pipe(
      map(allContact => allContact.find(contact => contact.companyID === companyID))
    );
  }

  getContact(id: string): Observable<Contact> {
    return this.http.get<Contact>(`${this.url}/GetAddressById?id=${id}`);
  }

  updateContact(id: string, updateAddressRequest: Contact | FormData): Observable<Contact> {
    return this.http.put<Contact>(`${this.url}/EditAddress/${id}`, updateAddressRequest);
  }
}
