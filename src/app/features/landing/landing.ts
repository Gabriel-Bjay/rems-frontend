import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './landing.html',
    styleUrl: './landing.css',
})
export class Landing {
    steps = [
        {
            label: 'Register',
            title: 'A property comes on',
            body: 'An owner registers a property; its units are listed and approved before they can be let.',
            icon: 'M4 21V6l8-3 8 3v15M9 10h2M9 14h2M13 10h2M13 14h2',
        },
        {
            label: 'Let',
            title: 'A tenancy is drafted',
            body: 'An agent drafts a tenancy for an approved unit. Exactly one active tenancy can exist per unit — enforced at the database, not just the UI.',
            icon: 'M6 2h9l5 5v15H6zM14 2v6h6',
        },
        {
            label: 'Bill',
            title: 'Rent is invoiced',
            body: 'Invoices are raised on a billing cycle; payments arrive and are reconciled against outstanding balances.',
            icon: 'M4 4h16v16H4zM4 12h16M12 4v16',
        },
        {
            label: 'Maintain',
            title: 'The tenancy runs its course',
            body: 'Maintenance tickets and vacate notices run alongside the tenancy; deposits are refunded when it ends.',
            icon: 'M4 20a8 8 0 0116 0M12 12a4 4 0 100-8 4 4 0 000 8',
        },
    ];

    roles = [
        { name: 'Admin', desc: 'Full visibility across owners, agents, tenants and every resource.' },
        { name: 'Owner', desc: 'Manages their own properties, units and the tenancies drafted against them.' },
        { name: 'Agent', desc: 'Drafts tenancies, manages units and tenants on an owner’s behalf.' },
        { name: 'Tenant', desc: 'Views their own tenancy, invoices and payment history.' },
    ];
}
