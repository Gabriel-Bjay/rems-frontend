import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, LoginResponse } from '../models/user';

@Injectable({ providedIn: 'root' })
export class Auth {
    private http = inject(HttpClient);
    private router = inject(Router);

    private tokenKey = 'rems_token';
    private userKey = 'rems_user';

    readonly currentUser = signal<User | null>(this.readStoredUser());

    readonly role = computed(() => this.currentUser()?.role ?? null);
    readonly isAdmin = computed(() => this.role() === 'admin');
    readonly isOwner = computed(() => this.role() === 'owner');
    readonly isAgent = computed(() => this.role() === 'agent');
    readonly isTenant = computed(() => this.role() === 'tenant');
    readonly isLoggedIn = computed(() => this.currentUser() !== null);

    async login(email: string, password: string): Promise<User> {
        const res = await firstValueFrom(
            this.http.post<LoginResponse>(`${environment.apiUrl}/login`, { email, password })
        );
        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem(this.userKey, JSON.stringify(res.user));
        this.currentUser.set(res.user);
        return res.user;
    }

    async logout(): Promise<void> {
        try {
            await firstValueFrom(this.http.post(`${environment.apiUrl}/logout`, {}));
        } catch {}
            this.clearSession();
            this.router.navigateByUrl('/login');
    }

    // Re-confirm the user from the API, useful on a hard refresh.
    async refreshUser(): Promise<void> {
        if (!this.getToken()) return;
        try {
            const user = await firstValueFrom(this.http.get<User>(`${environment.apiUrl}/me`));
            localStorage.setItem(this.userKey, JSON.stringify(user));
            this.currentUser.set(user);
        } catch {
            this.clearSession();
        }
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
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