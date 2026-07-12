import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, LoginResponse } from '../models/user';

@Injectable({ providedIn: 'root' })
export class Auth {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;
    private tokenKey = 'rems_token';

    currentUser = signal<User | null>(null);

    login(email: string, password: string) {
        return this.http
            .post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
            .pipe(
                tap((res) => {
                    localStorage.setItem(this.tokenKey, res.token);
                    this.currentUser.set(res.user);
                })
            );
    }

    logout() {
        return this.http
        .post(`${this.apiUrl}/logout`, {})
        .pipe(
            tap(() => this.clearSession())
        );
    }

    me() {
        return this.http
        .get<User>(`${this.apiUrl}/me`)
        .pipe(
            tap((user) => this.currentUser.set(user))
        );
    }

    token(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    isLoggedIn(): boolean {
        return !!this.token();
    }

    clearSession(): void {
        localStorage.removeItem(this.tokenKey);
        this.currentUser.set(null);
    }
}