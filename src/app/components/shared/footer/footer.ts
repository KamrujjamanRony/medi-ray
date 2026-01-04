import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactM } from '../../../utils/models';
import { ContactS } from '../../../services/contact-s';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  contactService = inject(ContactS);
  contact = signal<ContactM>({} as ContactM);
  ngOnInit() {
    this.contactService.getContact(environment.companyCode).subscribe(data => data && this.contact.set(data));
  }
}
