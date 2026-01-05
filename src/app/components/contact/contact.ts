import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Field, form, maxLength, minLength, required, validate } from '@angular/forms/signals';
import { ContactS } from '../../services/contact-s';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faPaperPlane, faUser, faTag } from '@fortawesome/free-solid-svg-icons';
import { environment } from '../../../environments/environment';
import { max } from 'rxjs';
import { ContactFormM } from '../../utils/models';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, FormsModule, FontAwesomeModule, Field],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  faEnvelope = faEnvelope;
  faPaperPlane = faPaperPlane;
  faUser = faUser;
  faTag = faTag;

  /* ---------------- DI ---------------- */
  private contactService = inject(ContactS);

  /* ---------------- SIGNAL STATE ---------------- */
  contactInfo = signal<any>(null);
  isLoading = signal(false);
  hasError = signal(false);
  isSubmitted = signal(false);
  isSuccess = signal(false);

  /* ---------------- FORM MODEL ---------------- */
  model = signal({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  /* ---------------- SIGNAL FORM ---------------- */
  form = form(this.model, (schemaPath) => {
    required(schemaPath.name, { message: 'Name is required' });
    maxLength(schemaPath.name, 50, { message: 'Name cannot exceed 50 characters' });
    required(schemaPath.email, { message: 'Email is required' });
    maxLength(schemaPath.email, 100, { message: 'Email cannot exceed 100 characters' });
    required(schemaPath.subject, { message: 'Subject is required' });
    minLength(schemaPath.subject, 3, { message: 'Subject must be at least 3 characters' });
    maxLength(schemaPath.subject, 100, { message: 'Subject cannot exceed 100 characters' });
    required(schemaPath.message, { message: 'Message is required' });
    maxLength(schemaPath.message, 1000, { message: 'Message cannot exceed 1000 characters' });
    
    validate(schemaPath.email, ({ value }) => {
      if (value() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value())) {
        return {
          kind: 'email',
          message: 'Please enter a valid email address'
        }
      }
      return null;
    });
    
    validate(schemaPath.message, ({ value }) => {
      if (value() && value().length < 10) {
        return {
          kind: 'minlength',
          message: 'Message must be at least 10 characters'
        }
      }
      return null;
    });
  });

  /* ---------------- LIFECYCLE ---------------- */
  ngOnInit(): void {
    this.loadContactInfo();
  }

  /* ---------------- LOAD CONTACT INFO ---------------- */
  loadContactInfo() {
  this.isLoading.set(true);
  this.hasError.set(false);

  this.contactService.getContact(environment.companyCode).subscribe({
    next: (data) => {
      if (!data.email) {
        this.hasError.set(true);
        console.error('Contact email not found in contact info');
      } else {
        this.contactInfo.set(data);
      }
      this.isLoading.set(false);
    },
    error: () => {
      this.hasError.set(true);
      this.isLoading.set(false);
    }
  });
}

  /* ---------------- SUBMIT ---------------- */
  onSubmit(event: Event) {
  event.preventDefault();

  if (!this.form().valid()) {
    return;
  }

  this.isSubmitted.set(true);

  const formValue = this.form().value();
  
  // Get the contact email from your ContactM data
  const contactEmail = this.contactInfo()?.email;
  
  if (!contactEmail) {
    alert('Unable to send message. Contact email not found.');
    this.isSubmitted.set(false);
    return;
  }

  const emailData: ContactFormM = {
    name: formValue.name,
    email: contactEmail,
    subject: formValue.subject,
    message: formValue.message,
    toEmail: contactEmail
  };

  console.log('Sending email to:', contactEmail);
  console.log('Email data:', {
    name: emailData.name,
    from: emailData.email,
    to: emailData.toEmail,
    subject: emailData.subject
  });

  this.contactService.sendContactEmail(emailData).subscribe({
    next: (response) => {
      console.log('Email sent successfully:', response);
      this.isSubmitted.set(false);
      this.isSuccess.set(true);
      this.formReset();
      
      // Show success message with recipient
      setTimeout(() => this.isSuccess.set(false), 5000);
    },
    error: (error) => {
      console.error('Error sending email:', error);
      this.isSubmitted.set(false);
      
      // Show specific error message
      const errorMessage = error.error?.message || 
                          'Failed to send message. Please try again later.';
      alert(errorMessage);
    }
  });
}

  /* ---------------- RESET ---------------- */
  formReset() {
    this.model.set({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
    this.form().reset();
  }

}
