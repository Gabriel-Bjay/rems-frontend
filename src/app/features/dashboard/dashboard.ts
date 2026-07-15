import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DxButtonModule } from 'devextreme-angular';
import { Auth } from '../../core/services/auth';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [DxButtonModule],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css',
})
export class Dashboard {
    private auth = inject(Auth);
    private router = inject(Router);

    user = this.auth.currentUser;

    onLogout() {
        this.auth.logout().subscribe({
            next: () => this.router.navigate(['/login']),
            error: () => this.router.navigate(['/login']),
        });
    }

    goToOwners() {
        this.router.navigate(['/owners']);
    }
}