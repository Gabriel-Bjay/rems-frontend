import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DxTextBoxModule, DxButtonModule } from 'devextreme-angular';
import { Auth } from '../../../core/services/auth';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [DxTextBoxModule, DxButtonModule],
    templateUrl: './login.html',
    styleUrl: './login.css',
})
export class Login {
    private auth = inject(Auth);
    private router = inject(Router);

    email = '';
    password = '';
    errorMessage = signal<string | null>(null);
    loading = signal(false);

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
}