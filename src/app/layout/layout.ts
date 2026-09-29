import { Component, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { DxButtonModule } from 'devextreme-angular';
import { Auth } from '../core/services/auth';
import { Role } from '../core/models/user';
import { NotificationBell } from './notification-bell/notification-bell';

interface NavItem {
    label: string;
    route: string;
    icon: string;
    roles: Role[];
    section: 'Overview' | 'Money' | 'Portfolio' | 'People';
}

const EVERYONE: Role[] = ['admin', 'owner', 'agent', 'tenant'];
const STAFF_AND_OWNERS: Role[] = ['admin', 'owner', 'agent'];

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [RouterOutlet, RouterLink, RouterLinkActive, DxButtonModule, NotificationBell],
    templateUrl: './layout.html',
    styleUrl: './layout.css',
})
export class Layout {
    private auth = inject(Auth);
    private router = inject(Router);

    user = this.auth.currentUser;
    role = this.auth.roles;

    private allNav: NavItem[] = [
        { section: 'Overview',  label: 'Dashboard',   route: '/app/dashboard',   icon: 'M3 12l9-8 9 8M5 10v9h14v-9', roles: EVERYONE },
        { section: 'Money',     label: 'Invoices',    route: '/app/invoices',    icon: 'M7 3h10v18l-2.5-1.5L12 21l-2.5-1.5L7 21zM10 8h4M10 12h4M10 16h2', roles: EVERYONE },
        { section: 'Money',     label: 'Payments',    route: '/app/payments',    icon: 'M3 6h18v12H3zM3 10h18M7 15h4', roles: EVERYONE },
        { section: 'Portfolio', label: 'Properties',  route: '/app/properties',  icon: 'M4 21V6l8-3 8 3v15M9 10h2M9 14h2M13 10h2M13 14h2', roles: STAFF_AND_OWNERS },
        { section: 'Portfolio', label: 'Units',       route: '/app/units',       icon: 'M4 4h16v16H4zM4 12h16M12 4v16', roles: STAFF_AND_OWNERS },
        { section: 'Portfolio', label: 'Tenancies',   route: '/app/tenancies',   icon: 'M6 2h9l5 5v15H6zM14 2v6h6', roles: STAFF_AND_OWNERS },
        { section: 'Portfolio', label: 'Maintenance', route: '/app/maintenance', icon: 'M14.7 6.3a4 4 0 00-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 005.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z', roles: EVERYONE },
        { section: 'People',    label: 'Owners',      route: '/app/owners',      icon: 'M4 20a8 8 0 0116 0M12 12a4 4 0 100-8 4 4 0 000 8', roles: ['admin'] },
        { section: 'People',    label: 'Agents',      route: '/app/agents',      icon: 'M4 20a8 8 0 0113-6.7M12 12a4 4 0 100-8 4 4 0 000 8M15 18l2 2 4-4', roles: ['admin'] },
        { section: 'People',    label: 'Tenants',     route: '/app/tenants',     icon: 'M2 20a6 6 0 0112 0M8 11a3 3 0 100-6 3 3 0 000 6M15 8a3 3 0 110 6M14 20a6 6 0 018-5.7', roles: ['admin'] },
    ];

    /** Menu sections the signed-in roles can see, in order, without empty headings. */
    nav = computed(() => {
        const currentRoles = this.role();
        const visible = this.allNav.filter(item => item.roles.some(role => currentRoles.includes(role)));
        const sections = [...new Set(visible.map(item => item.section))];

        return sections.map(section => ({ section, items: visible.filter(item => item.section === section) }));
    });

    initials = computed(() => {
        const name = this.user()?.name ?? '';
        const parts = name.trim().split(/\s+/);
        const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
        return (letters || '?').toUpperCase();
    });

    goToDash(){
      this.router.navigate(['/app/dashboard'])
    }

    onLogout() {
        this.auth.logout();
    }
}