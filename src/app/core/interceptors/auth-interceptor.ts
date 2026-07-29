import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(Auth);
    // Support different Auth implementations: token as function, token property, or getToken
    const anyAuth = auth as any;
    const token = typeof anyAuth.token === 'function'
        ? anyAuth.token()
        : anyAuth.token ?? (typeof anyAuth.getToken === 'function' ? anyAuth.getToken() : anyAuth.getToken ?? null);

    if (token) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    return next(req);
};