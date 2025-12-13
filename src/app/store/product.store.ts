import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { withBaseMethods } from './appStore/base.store';
import { ProductInitialState } from './product.slice';
import { ProductService } from '../services/product.service';

export const ProductStore = signalStore(
  { providedIn: 'root' },
  withState(ProductInitialState),

  withComputed(({ products }) => ({
    // Add any Product-specific computed properties here
  })),

  withBaseMethods(),

  withMethods((store, productService = inject(ProductService)) => ({
    loadProduct: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          productService.getAllProducts().pipe(
            tap(products => patchState(store, { products, loading: false })),
            catchError(error => {
              patchState(store, { loading: false, error: 'Failed to load Product' });
              return of(null);
            })
          )
        )
      )
    ),

    addProduct: rxMethod<any>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((ProductData) =>
          productService.addProduct(ProductData).pipe(
            tap(newProduct => {
              const currentProduct = store.products();
              const products = [...currentProduct, newProduct];
              patchState(store, {
                products,
                loading: false,
                success: 'Product added successfully'
              });
            }),
            catchError(error => {
              patchState(store, { loading: false, error: 'Failed to add Product' });
              return of(null);
            })
          )
        )
      )
    ),

    updateProduct: rxMethod<{ id: any; data: any }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ id, data }) =>
          productService.updateProduct(id, data).pipe(
            tap(ProductData => {
              const currentProduct = store.products();
              const updatedProduct = currentProduct.map(dept =>
                dept.id === id ? { ...dept, ...ProductData } : dept
              );
              patchState(store, {
                products: updatedProduct,
                loading: false,
                success: 'Product updated successfully'
              });
            }),
            catchError(error => {
              patchState(store, { loading: false, error: 'Failed to update Product' });
              return of(null);
            })
          )
        )
      )
    ),

    deleteProduct: rxMethod<any>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          productService.deleteProduct(id).pipe(
            tap(() => {
              const currentProduct = store.products();
              const filteredProduct = currentProduct.filter(dept => dept.id !== id);
              patchState(store, {
                products: filteredProduct,
                loading: false,
                success: 'Product deleted successfully'
              });
            }),
            catchError(error => {
              patchState(store, { loading: false, error: 'Failed to delete Product' });
              return of(null);
            })
          )
        )
      )
    ),

    getProductById: (id: any) => {
      const product = store.products();
      return product.find(dept => dept.id === id) || null;
    }
  }))
);