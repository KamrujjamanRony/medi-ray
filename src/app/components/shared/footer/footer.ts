import { Component, inject, signal } from '@angular/core';
import { Contact } from '../../../store/contact.slice';
import { contactStore } from '../../../store/contact.store';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  contactStore = inject(contactStore);
  contact = signal<Contact>(this.contactStore.contact());

}
