import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { ContactFormM } from '../utils/models';



@Injectable({
  providedIn: 'root',
})
export class ContactS {
  http = inject(HttpClient);
  url = `${environment.apiUrl}/Address`;

  getContact(id: number = environment.companyCode): Observable<any> {
    return this.http.get(`${this.url}/${id}`);
  }
  updateContact(id: string, updateAddressRequest: any | FormData): Observable<any> {
    return this.http.put(`${this.url}/${id}`, updateAddressRequest);
  }  
  // Send contact email
  sendContactEmail(contactData: ContactFormM): Observable<any> {
    return this.http.post(`/api/email/send-contact`, contactData);
  }
  
}
