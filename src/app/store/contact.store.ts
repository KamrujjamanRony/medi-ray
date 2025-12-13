import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { withBaseMethods } from './appStore/base.store';
import { contactInitialState } from './contact.slice';
import { ContactService } from '../services/contact.service';
import { environment } from '../../environments/environment';

export const contactStore = signalStore(
  { providedIn: 'root' },
  withState(contactInitialState),

  withComputed(({ contact }) => ({
    // Add any contact-specific computed properties here
  })),

  withBaseMethods(),

  withMethods((store, contactService = inject(ContactService)) => ({
    loadContact: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          contactService.getCompanyContact(environment.companyCode).pipe(
            tap(contact => patchState(store, { contact, loading: false })),
            catchError(error => {
              patchState(store, { loading: false, error: 'Failed to load contact' });
              return of(null);
            })
          )
        )
      )
    ),

    // addContact: rxMethod<any>(
    //   pipe(
    //     tap(() => patchState(store, { loading: true, error: null })),
    //     switchMap((contactData) =>
    //       contactService.addContact(contactData).pipe(
    //         tap(newContact => {
    //           const currentContact = store.contact();
    //           const contact = [...currentContact, newContact];
    //           patchState(store, {
    //             contact,
    //             loading: false,
    //             success: 'contact added successfully'
    //           });
    //         }),
    //         catchError(error => {
    //           patchState(store, { loading: false, error: 'Failed to add contact' });
    //           return of(null);
    //         })
    //       )
    //     )
    //   )
    // ),

    updateContact: rxMethod<{ id: any; data: any }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ id, data }) =>
          contactService.updateContact(id, data).pipe(
            tap(contact => {
              patchState(store, {
                contact,
                loading: false,
                success: 'Contact updated successfully'
              });
            }),
            catchError(error => {
              patchState(store, { loading: false, error: 'Failed to update contact' });
              return of(null);
            })
          )
        )
      )
    ),

    // deleteContact: rxMethod<any>(
    //   pipe(
    //     tap(() => patchState(store, { loading: true, error: null })),
    //     switchMap((id) =>
    //       contactService.deleteContact(id).pipe(
    //         tap(() => {
    //           const currentContact = store.contact();
    //           const filteredContact = currentContact.filter(dept => dept.id !== id);
    //           patchState(store, {
    //             contact: filteredContact,
    //             loading: false,
    //             success: 'contact deleted successfully'
    //           });
    //         }),
    //         catchError(error => {
    //           patchState(store, { loading: false, error: 'Failed to delete contact' });
    //           return of(null);
    //         })
    //       )
    //     )
    //   )
    // ),
  }))
);