import { Component, inject } from '@angular/core';
import { DxDataGridModule } from 'devextreme-angular';
import CustomStore from 'devextreme/data/custom_store';
import { TenantsApi } from '../tenants-api';

@Component({
    selector: 'app-tenants-list',
    standalone: true,
    imports: [DxDataGridModule],
    templateUrl: './tenants-list.html',
    styleUrl: './tenants-list.css',
})
export class TenantsList {
    private tenantsApi = inject(TenantsApi);
    dataSource: CustomStore = this.tenantsApi.getStore();

    // Used by the "Tenant" display column for the avatar + full name.
    fullName = (row: any) => `${row?.fname ?? ''} ${row?.lname ?? ''}`.trim();
    initials = (row: any) => `${row?.fname?.[0] ?? ''}${row?.lname?.[0] ?? ''}`;
}