import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { withBaseMethods } from './appStore/base.store';
import { aboutInitialState } from './about.slice';
import { AboutService } from '../services/about.service';
import { environment } from '../../environments/environment';

const companyCode = environment.companyCode;

export const AboutStore = signalStore(
  { providedIn: 'root' },
  withState(aboutInitialState),

  withComputed(({ about }) => ({
    // Add any About-specific computed properties here
  })),

  withBaseMethods(),

  withMethods((store, aboutService = inject(AboutService)) => ({
    loadAbout: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          aboutService.getCompanyAbout(companyCode).pipe(
            tap(about => patchState(store, { about, loading: false })),
            catchError(error => {
              patchState(store, { loading: false, error: 'Failed to load About' });
              return of(null);
            })
          )
        )
      )
    ),

    // addAbout: rxMethod<any>(
    //   pipe(
    //     tap(() => patchState(store, { loading: true, error: null })),
    //     switchMap((aboutData) =>
    //       aboutService.addAbout(aboutData).pipe(
    //         tap(newAbout => {
    //           const currentAbout = store.about();
    //           const about = [...currentAbout, newAbout];
    //           patchState(store, {
    //             about,
    //             loading: false,
    //             success: 'About added successfully'
    //           });
    //         }),
    //         catchError(error => {
    //           patchState(store, { loading: false, error: 'Failed to add About' });
    //           return of(null);
    //         })
    //       )
    //     )
    //   )
    // ),

    updateAbout: rxMethod<{ id: any; data: any }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ id, data }) =>
          aboutService.updateAbout(id, data).pipe(
            tap(about => {
              patchState(store, {
                about,
                loading: false,
                success: 'About updated successfully'
              });
            }),
            catchError(error => {
              patchState(store, { loading: false, error: 'Failed to update About' });
              return of(null);
            })
          )
        )
      )
    ),

    // deleteAbout: rxMethod<any>(
    //   pipe(
    //     tap(() => patchState(store, { loading: true, error: null })),
    //     switchMap((id) =>
    //       aboutService.deleteAbout(id).pipe(
    //         tap(() => {
    //           const currentAbout = store.about();
    //           const filteredAbout = currentAbout.filter(dept => dept.id !== id);
    //           patchState(store, {
    //             about: filteredAbout,
    //             loading: false,
    //             success: 'About deleted successfully'
    //           });
    //         }),
    //         catchError(error => {
    //           patchState(store, { loading: false, error: 'Failed to delete About' });
    //           return of(null);
    //         })
    //       )
    //     )
    //   )
    // ),
  }))
);