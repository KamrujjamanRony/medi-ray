import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { withBaseMethods } from './appStore/base.store';
import { CarouselInitialState } from './carousel.slice';
import { CarouselService } from '../services/carousel.service';

export const CarouselStore = signalStore(
  { providedIn: 'root' },
  withState(CarouselInitialState),

  withComputed(({ carousel }) => ({
    // Add any Carousel-specific computed properties here
  })),

  withBaseMethods(),

  withMethods((store, carouselService = inject(CarouselService)) => ({
    loadCarousel: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          carouselService.getAllCarousel().pipe(
            tap(carousel => patchState(store, { carousel, loading: false })),
            catchError(error => {
              patchState(store, { loading: false, error: 'Failed to load Carousel' });
              return of(null);
            })
          )
        )
      )
    ),

    addCarousel: rxMethod<any>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((carouselData) =>
          carouselService.addCarousel(carouselData).pipe(
            tap(newCarousel => {
              const currentCarousel = store.carousel();
              const carousel = [...currentCarousel, newCarousel];
              patchState(store, {
                carousel,
                loading: false,
                success: 'Carousel added successfully'
              });
            }),
            catchError(error => {
              patchState(store, { loading: false, error: 'Failed to add Carousel' });
              return of(null);
            })
          )
        )
      )
    ),

    updateCarousel: rxMethod<{ id: any; data: any }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ id, data }) =>
          carouselService.updateCarousel(id, data).pipe(
            tap(carouselData => {
              const currentCarousel = store.carousel();
              const updatedCarousel = currentCarousel.map(dept =>
                dept.id === id ? { ...dept, ...carouselData } : dept
              );
              patchState(store, {
                carousel: updatedCarousel,
                loading: false,
                success: 'Carousel updated successfully'
              });
            }),
            catchError(error => {
              patchState(store, { loading: false, error: 'Failed to update Carousel' });
              return of(null);
            })
          )
        )
      )
    ),

    deleteCarousel: rxMethod<any>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          carouselService.deleteCarousel(id).pipe(
            tap(() => {
              const currentCarousel = store.carousel();
              const filteredCarousel = currentCarousel.filter(dept => dept.id !== id);
              patchState(store, {
                carousel: filteredCarousel,
                loading: false,
                success: 'Carousel deleted successfully'
              });
            }),
            catchError(error => {
              patchState(store, { loading: false, error: 'Failed to delete Carousel' });
              return of(null);
            })
          )
        )
      )
    ),

    getCarouselById: (id: any) => {
      const Carousel = store.carousel();
      return Carousel.find(dept => dept.id === id) || null;
    }
  }))
);