import { Component, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { DxButtonModule } from 'devextreme-angular';
import { Auth } from '../core/services/auth';
import { Role } from '../core/models/user';

interface NavItem {
    label: string;
    route: string;
    icon: string;
    roles: Role[];
}

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [RouterOutlet, RouterLink, RouterLinkActive, DxButtonModule],
    templateUrl: './layout.html',
    styleUrl: './layout.css',
})
export class Layout {
    private auth = inject(Auth);

    user = this.auth.currentUser;
    role = this.auth.role;

    private allNav: NavItem[] = [
        { label: 'Dashboard',  route: '/dashboard',  icon: 'M3 12l9-8 9 8M5 10v9h14v-9', roles: ['admin', 'owner', 'agent', 'tenant'] },
        { label: 'Properties', route: '/properties', icon: 'M4 21V6l8-3 8 3v15M9 10h2M9 14h2M13 10h2M13 14h2', roles: ['admin', 'owner', 'agent'] },
        { label: 'Units',      route: '/units',      icon: 'M4 4h16v16H4zM4 12h16M12 4v16', roles: ['admin', 'owner', 'agent'] },
        { label: 'Tenancies',  route: '/tenancies',  icon: 'M6 2h9l5 5v15H6zM14 2v6h6', roles: ['admin', 'owner', 'agent'] },
        { label: 'Owners',     route: '/owners',     icon: 'M4 20a8 8 0 0116 0M12 12a4 4 0 100-8 4 4 0 000 8', roles: ['admin'] },
        { label: 'Agents',     route: '/agents',     icon: 'M4 20a8 8 0 0113-6.7M12 12a4 4 0 100-8 4 4 0 000 8M15 18l2 2 4-4', roles: ['admin'] },
        { label: 'Tenants',    route: '/tenants',    icon: 'M2 20a6 6 0 0112 0M8 11a3 3 0 100-6 3 3 0 000 6M15 8a3 3 0 110 6M14 20a6 6 0 018-5.7', roles: ['admin'] },
    ];

    nav = computed(() => {
        const current = this.role();
        return current ? this.allNav.filter((item) => item.roles.includes(current)) : [];
    });

    initials = computed(() => {
        const name = this.user()?.name ?? '';
        const parts = name.trim().split(/\s+/);
        const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
        return (letters || '?').toUpperCase();
    });

    onLogout() {
        this.auth.logout();
    }
}