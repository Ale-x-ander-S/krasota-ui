import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: 'products', loadComponent: () => import('./pages/products').then(m => m.ProductsComponent) },
  { path: 'product/:id', loadComponent: () => import('./pages/product-detail').then(m => m.ProductDetailComponent) },
  { path: 'categories', loadComponent: () => import('./pages/categories').then(m => m.CategoriesComponent) },
  { path: 'about', loadComponent: () => import('./pages/about').then(m => m.AboutComponent) },
  { path: 'contacts', loadComponent: () => import('./pages/contacts').then(m => m.ContactsComponent) },
  { path: 'delivery', loadComponent: () => import('./pages/delivery').then(m => m.DeliveryComponent) },
  { path: 'returns', loadComponent: () => import('./pages/returns').then(m => m.ReturnsComponent) },
  { path: 'privacy', loadComponent: () => import('./pages/privacy').then(m => m.PrivacyComponent) },
  { path: 'terms', loadComponent: () => import('./pages/terms').then(m => m.TermsComponent) },
  { path: 'cart', loadComponent: () => import('./pages/cart').then(m => m.CartComponent) },
  { path: 'checkout', loadComponent: () => import('./pages/checkout').then(m => m.CheckoutComponent) },
  { path: 'auth', loadComponent: () => import('./pages/auth').then(m => m.AuthComponent) },
  { path: 'profile', loadComponent: () => import('./pages/profile').then(m => m.ProfileComponent), canActivate: [AuthGuard] },
  { path: 'orders', loadComponent: () => import('./pages/orders').then(m => m.OrdersComponent), canActivate: [AuthGuard] },
  { path: 'order/:id', loadComponent: () => import('./pages/order-detail').then(m => m.OrderDetailComponent), canActivate: [AuthGuard] },
  { path: 'admin', loadComponent: () => import('./pages/admin').then(m => m.AdminComponent) },
  { path: 'admin/orders', loadComponent: () => import('./pages/admin-orders').then(m => m.AdminOrdersComponent) },
  { path: '**', redirectTo: '/products' }
];
