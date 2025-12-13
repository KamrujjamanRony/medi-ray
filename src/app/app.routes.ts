import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/main/main').then(m => m.Main),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/home/home').then(m => m.Home),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./components/products/products').then(m => m.Products),
      },
      {
        path: 'product/:id',
        loadComponent: () =>
          import('./components/product-view/product-view').then(m => m.ProductView)
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./components/about/about').then(m => m.AboutComponent),
      },
    ],
  },
];
