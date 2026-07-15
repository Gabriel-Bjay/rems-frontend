import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import CustomStore from 'devextreme/data/custom_store';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PropertiesApi {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/properties`;

    getStore(): CustomStore {
        return new CustomStore({
            key: 'id',
            load: () => firstValueFrom(this.http.get<any[]>(this.apiUrl)),
            byKey: (key) => firstValueFrom(this.http.get<any>(`${this.apiUrl}/${key}`)),
            insert: (values) => firstValueFrom(this.http.post(this.apiUrl, values)),
            update: async (key, values) => {
                const current = await firstValueFrom(this.http.get<any>(`${this.apiUrl}/${key}`));
                const merged = { ...current, ...values };
                return firstValueFrom(this.http.put(`${this.apiUrl}/${key}`, merged));
            },
            remove: (key) => firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${key}`)),
        });
    }
}