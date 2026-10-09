import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.Home),
  },
  {
    path: 'shop',
    loadComponent: () => import('./pages/catalog/catalog').then(m => m.Catalog),
  },
  {
    path: 'collections',
    loadComponent: () => import('./pages/collections/collections').then(m => m.Collections),
  },
  {
    path: 'products',
    redirectTo: 'shop',
    pathMatch: 'full',
  },
  {
    path: 'shop/:slug',
    loadComponent: () => import('./pages/product-detail/product-detail').then(m => m.ProductDetail),
  },
  {
    path: 'product/:slug',
    loadComponent: () => import('./pages/product-detail/product-detail').then(m => m.ProductDetail),
  },
  {
    path: 'products/:slug',
    loadComponent: () => import('./pages/product-detail/product-detail').then(m => m.ProductDetail),
  },
  {
    path: 'categories',
    loadComponent: () => import('./pages/categories/categories').then(m => m.Categories),
  },
  {
    path: 'category/:slug',
    loadComponent: () => import('./pages/catalog/catalog').then(m => m.Catalog),
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then(m => m.About),
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then(m => m.Contact),
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./pages/admin/admin-login/admin-login').then(m => m.AdminLogin),
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

