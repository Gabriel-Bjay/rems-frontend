import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import CustomStore from 'devextreme/data/custom_store';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OwnersApi {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/owners`;

    getStore(): CustomStore {
        return new CustomStore({
            key: 'id',
            load: () => firstValueFrom(this.http.get<any[]>(this.apiUrl)),
        });
    }
}