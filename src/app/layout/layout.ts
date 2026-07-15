import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { DxButtonModule } from 'devextreme-angular';
import { Auth } from '../core/services/auth';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [RouterOutlet, RouterLink, RouterLinkActive, DxButtonModule],
    templateUrl: './layout.html',
    styleUrl: './layout.css',
})
export class Layout {
    private auth = inject(Auth);
    private router = inject(Router);

    user = this.auth.currentUser;

    onLogout() {
        this.auth.logout().subscribe({
            next: () => {
                this.auth.clearSession();
                this.router.navigate(['/login']);
            },
            error: () => {
                this.auth.clearSession();
                this.router.navigate(['/login']);
            },
        });
    }
}