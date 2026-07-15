import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
    },
    {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
    },
    {
        path: 'owners',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/owners/owners-list/owners-list').then((m) => m.OwnersList),
    },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: '**', redirectTo: 'dashboard' },
];