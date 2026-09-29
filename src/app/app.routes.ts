import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/landing/landing').then((m) => m.Landing),
        pathMatch: 'full',
    },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
    },
    {
        path: 'app',
        loadComponent: () => import('./layout/layout').then((m) => m.Layout),
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./features/dashboard/dashboard').then((m) => m.Dashboard),
            },
            {
                path: 'owners',
                loadComponent: () =>
                    import('./features/owners/owners-list/owners-list').then((m) => m.OwnersList),
            },
            {
                path: 'properties',
                loadComponent: () =>
                    import('./features/properties/properties-list/properties-list').then(
                        (m) => m.PropertiesList
                    ),
            },
            {
                path: 'units',
                loadComponent: () =>
                    import('./features/units/units-list/units-list').then((m) => m.UnitsList),
            },
            {
                path: 'agents',
                loadComponent: () =>
                    import('./features/agents/agents-list/agents-list').then((m) => m.AgentsList),
            },
            {
                path: 'tenants',
                loadComponent: () =>
                    import('./features/tenants/tenants-list/tenants-list').then((m) => m.TenantsList),
            },
            {
                path: 'tenancies',
                loadComponent: () =>
                    import('./features/tenancies/tenancies-list/tenancies-list').then((m) => m.TenanciesList),
            },
            {
                path: 'invoices',
                loadComponent: () =>
                    import('./features/invoices/invoices-list/invoices-list').then((m) => m.InvoicesList),
            },
            {
                // Notification links point at one invoice; open it over the list.
                path: 'invoices/:id',
                redirectTo: ({ params }) =>
                    inject(Router).createUrlTree(['/app/invoices'], { queryParams: { invoice: params['id'] } }),
            },
            {
                path: 'payments',
                loadComponent: () =>
                    import('./features/payments/payments-list/payments-list').then((m) => m.PaymentsList),
            },
            {
                path: 'maintenance',
                loadComponent: () =>
                    import('./features/maintenance/maintenance-board/maintenance-board').then((m) => m.MaintenanceBoard),
            },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        ],
    },
    { path: '**', redirectTo: '' },
];