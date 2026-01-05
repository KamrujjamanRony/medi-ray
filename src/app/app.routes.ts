import { Routes } from '@angular/router';
import { Admin } from './layouts/admin/admin';
import { Page } from './components/shared/page/page';
import { Login } from './components/admin/login/login';
import { authGuard } from './services/auth/auth-guard';

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
      {
        path: 'contact',
        loadComponent: () =>
          import('./components/contact/contact').then(m => m.Contact),
      },
      {
        path: 'test',
        component: Page,
      },
    ],
  },
  {
    path: 'admin',
    component: Admin,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'carousel', pathMatch: 'full' },
      {
        path: 'carousel',
        loadComponent: () =>
          import('./components/admin/carousel-list/carousel-list').then(m => m.CarouselList),
        data: { preload: true },
      },
      {
        path: 'item',
        loadComponent: () =>
          import('./components/admin/item-list/item-list').then(m => m.ItemList),
        data: { preload: true },
      },
      {
        path: 'product',
        loadComponent: () =>
          import('./components/admin/product-list/product-list').then(m => m.ProductList),
        data: { preload: true },
      },
      {
        path: 'user',
        loadComponent: () =>
          import('./components/admin/users/users.component').then(m => m.UsersComponent),
        data: { preload: true },
      },
      {
        path: 'menu',
        loadComponent: () =>
          import('./components/admin/menu-list/menu-list.component').then(m => m.MenuListComponent),
        data: { preload: true },
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./components/admin/about-update/about-update').then(m => m.AboutUpdate),
        data: { preload: true },
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./components/admin/contact-update/contact-update').then(m => m.ContactUpdate),
        data: { preload: true },
      },
    ],
  },
  {
    path: 'login',
    component: Login
  }
];
