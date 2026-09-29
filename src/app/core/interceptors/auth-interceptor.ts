import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(Auth);
    const router = inject(Router);
    const token = auth.getToken();

    req = req.clone({
        setHeaders: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            // A revoked or expired token: end the stale session rather than
            // leave every page failing. The login call reports its own 401.
            if (error.status === 401 && token && !req.url.endsWith('/login')) {
                auth.clearSession();
                router.navigateByUrl('/login');
            }
            return throwError(() => error);
        }),
    );
};
