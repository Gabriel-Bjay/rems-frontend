import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DxTextBoxModule, DxButtonModule } from 'devextreme-angular';
import { TextEditorButton } from 'devextreme/common';
import { ClickEvent } from 'devextreme/ui/button';
import dxButton from 'devextreme/ui/button';
import { Auth } from '../../../core/services/auth';
import { DemoAccount } from '../../../core/models/user';

const DEMO_ROLES: Record<DemoAccount['role'], { label: string; hint: string }> = {
    owner: { label: 'Owner', hint: 'Their properties, rent collected and arrears' },
    agent: { label: 'Agent', hint: 'Units, payments to confirm, repair requests' },
    tenant: { label: 'Tenant', hint: 'Rent due, invoices, payments and repairs' },
};

// The API sits on a free host that sleeps when idle, so the first request
// after a quiet spell can take about a minute. Say so once a wait passes this.
const WAKE_NOTICE_AFTER_MS = 3000;

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

    private slowRequests = signal(0);
    serverWaking = computed(() => this.slowRequests() > 0);

    showPassword = signal(false);
    readonly passwordButtons: TextEditorButton[] = [{
        name: 'toggle-password',
        location: 'after',
        options: {
            icon: 'eyeopen',
            stylingMode: 'text',
            elementAttr: { 'aria-label': 'Show password', 'aria-pressed': 'false' },
            onClick: (e: ClickEvent) => this.togglePassword(e.component),
        },
    }];

    ngOnInit() {
        this.loadDemoAccounts();
    }

    async onLogin() {
        this.errorMessage.set(null);
        this.loading.set(true);

        try {
            await this.withWakeNotice(this.auth.login(this.email, this.password));
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
            await this.withWakeNotice(this.auth.demoLogin(role));
            this.loading.set(false);
            this.router.navigate(['/app/dashboard']);
        } catch {
            this.loading.set(false);
            this.errorMessage.set('The demo is unavailable right now. Please try again in a moment.');
        }
    }

    // One "Show password" button whose pressed state flips, rather than a
    // label that changes, so screen readers announce it as a toggle.
    private togglePassword(button: dxButton) {
        const show = !this.showPassword();
        this.showPassword.set(show);
        button.option('icon', show ? 'eyeclose' : 'eyeopen');
        button.option('elementAttr', { 'aria-label': 'Show password', 'aria-pressed': String(show) });
    }

    private async withWakeNotice<T>(work: Promise<T>): Promise<T> {
        let slow = false;
        const timer = setTimeout(() => {
            slow = true;
            this.slowRequests.update(n => n + 1);
        }, WAKE_NOTICE_AFTER_MS);
        try {
            return await work;
        } finally {
            clearTimeout(timer);
            if (slow) this.slowRequests.update(n => n - 1);
        }
    }

    private async loadDemoAccounts() {
        try {
            this.demoAccounts.set(await this.withWakeNotice(this.auth.demoAccounts()));
        } catch {
            // No demo on this deployment; the sign-in form still works.
        } finally {
            this.demoChecking.set(false);
        }
    }
}
