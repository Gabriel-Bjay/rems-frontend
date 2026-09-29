import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DemoAccount, User, LoginResponse } from '../models/user';

@Injectable({ providedIn: 'root' })
export class Auth {
    private http = inject(HttpClient);
    private router = inject(Router);

    private tokenKey = 'rems_token';
    private userKey = 'rems_user';

    readonly currentUser = signal<User | null>(this.readStoredUser());

    readonly roles = computed(() => this.currentUser()?.roles ?? []);
    readonly isAdmin = computed(() => this.roles().includes('admin'));
    readonly isOwner = computed(() => this.roles().includes('owner'));
    readonly isAgent = computed(() => this.roles().includes('agent'));
    readonly isTenant = computed(() => this.roles().includes('tenant'));

    readonly isLoggedIn = computed(() => this.currentUser() !== null);

    async login(email: string, password: string): Promise<User> {
        const res = await firstValueFrom(
            this.http.post<LoginResponse>(`${environment.apiUrl}/login`, { email, password })
        );
        return this.startSession(res);
    }

    // Demo logins the API offers; empty when its public demo is off.
    async demoAccounts(): Promise<DemoAccount[]> {
        const res = await firstValueFrom(
            this.http.get<{ accounts: DemoAccount[] }>(`${environment.apiUrl}/demo-accounts`)
        );
        return res.accounts;
    }

    // Sign in as a demo owner, agent or tenant without a password.
    async demoLogin(role: DemoAccount['role']): Promise<User> {
        const res = await firstValueFrom(
            this.http.post<LoginResponse>(`${environment.apiUrl}/demo-login`, { role })
        );
        return this.startSession(res);
    }

    async logout(): Promise<void> {
        try {
            await firstValueFrom(
                this.http.post(`${environment.apiUrl}/logout`, {})
            );
        } catch {
            // Local logout must still succeed if the token has expired.
        } finally {
            this.clearSession();
            await this.router.navigateByUrl('/login');
    }
}

    // Re-confirm the user from the API, useful on a hard refresh.
    async refreshUser(): Promise<void> {
        if (!this.getToken()) return;
        try {
            const { user } = await firstValueFrom(this.http.get<{ user: User }>(`${environment.apiUrl}/me`));
            localStorage.setItem(this.userKey, JSON.stringify(user));
            this.currentUser.set(user);
        } catch {
            this.clearSession();
        }
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    private startSession(res: LoginResponse): User {
        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem(this.userKey, JSON.stringify(res.user));
        this.currentUser.set(res.user);
        return res.user;
    }

    clearSession(): void {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        this.currentUser.set(null);
    }

    private readStoredUser(): User | null {
        const raw = localStorage.getItem(this.userKey);
        return raw ? (JSON.parse(raw) as User) : null;
    }
}