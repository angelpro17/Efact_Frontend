import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
    { path: 'documents', loadComponent: () => import('./features/documents/document-viewer/document-viewer.component').then(m => m.DocumentViewerComponent), canActivate: [authGuard] },
    { path: '404', loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent) },
    { path: '**', redirectTo: '/404' }
];
