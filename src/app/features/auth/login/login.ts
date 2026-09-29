import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DxTextBoxModule, DxButtonModule } from 'devextreme-angular';
import { Auth } from '../../../core/services/auth';
import { DemoAccount } from '../../../core/models/user';

const DEMO_ROLES: Record<DemoAccount['role'], { label: string; hint: string }> = {
    owner: { label: 'Owner', hint: 'Their properties, rent collected and arrears' },
    agent: { label: 'Agent', hint: 'Units, payments to confirm, repair requests' },
    tenant: { label: 'Tenant', hint: 'Rent due, invoices, payments and repairs' },
};

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [DxTextBoxModule, DxButtonModule],
    templateUrl: './login.html',
    styleUrl: './login.css',
})
export class Login implements OnInit {
    private auth = inject(Auth);
    private router = inject(Router);

    email = '';
    password = '';
    errorMessage = signal<string | null>(null);
    loading = signal(false);

    // Offered only while the API's public demo is on.
    demoAccounts = signal<DemoAccount[]>([]);
    demoChecking = signal(true);
    readonly demoRoles = DEMO_ROLES;

    ngOnInit() {
        this.loadDemoAccounts();
    }

    async onLogin() {
        this.errorMessage.set(null);
        this.loading.set(true);

        try {
            await this.auth.login(this.email, this.password);
            this.loading.set(false);
            this.router.navigate(['/app/dashboard']);
        } catch {
            this.loading.set(false);
            this.errorMessage.set('Invalid email or password.');
        }
    }

    async onDemoLogin(role: DemoAccount['role']) {
        this.errorMessage.set(null);
        this.loading.set(true);

        try {
            await this.auth.demoLogin(role);
            this.loading.set(false);
            this.router.navigate(['/app/dashboard']);
        } catch {
            this.loading.set(false);
            this.errorMessage.set('The demo is unavailable right now. Please try again in a moment.');
        }
    }

    private async loadDemoAccounts() {
        try {
            this.demoAccounts.set(await this.auth.demoAccounts());
        } catch {
            // No demo on this deployment; the sign-in form still works.
        } finally {
            this.demoChecking.set(false);
        }
    }
}
