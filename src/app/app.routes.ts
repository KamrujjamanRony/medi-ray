import { Routes } from '@angular/router';
import { Admin } from './layouts/admin/admin';
import { authGuard } from './services/auth/auth.guard';
import { LoginComponent } from './components/admin/login/login.component';

export const routes: Routes = [
  // {
  //   path: '',
  //   loadComponent: () =>
  //     import('./layouts/main/main').then(m => m.Main),
  //   children: [
  //     {
  //       path: '',
  //       loadComponent: () =>
  //         import('./components/home/home').then(m => m.Home),
  //     },
  //     {
  //       path: 'products',
  //       loadComponent: () =>
  //         import('./components/products/products').then(m => m.Products),
  //     },
  //     {
  //       path: 'product/:id',
  //       loadComponent: () =>
  //         import('./components/product-view/product-view').then(m => m.ProductView)
  //     },
  //     {
  //       path: 'about',
  //       loadComponent: () =>
  //         import('./components/about/about').then(m => m.AboutComponent),
  //     },
  //   ],
  // },
  {
    path: 'admin',
    component: Admin,
    canActivate: [authGuard], 
    children: [
      { path: '', redirectTo: 'user', pathMatch: 'full' },
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
    ],
  },
  {
    path: 'login',
    component: LoginComponent
  }
];
