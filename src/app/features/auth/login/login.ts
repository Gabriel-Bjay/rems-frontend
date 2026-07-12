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

    onLogin() {
        this.errorMessage.set(null);
        this.loading.set(true);

        this.auth.login(this.email, this.password).subscribe({
            next: () => {
                this.loading.set(false);
                this.router.navigate(['/dashboard']);
            },
            error: () => {
                this.loading.set(false);
                this.errorMessage.set('Invalid email or password.');
            },
        });
    }
}