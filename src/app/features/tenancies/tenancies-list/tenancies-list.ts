import { Component, inject } from '@angular/core';
import { DxDataGridModule } from 'devextreme-angular';
import CustomStore from 'devextreme/data/custom_store';

import { TenanciesApi } from '../tenancies-api';
import { UnitsApi } from '../../units/units-api';
import { TenantsApi } from '../../tenants/tenants-api';
import { AgentsApi } from '../../agents/agents-api';

@Component({
    selector: 'app-tenancies-list',
    standalone: true,
    imports: [DxDataGridModule],
    templateUrl: './tenancies-list.html',
    styleUrl: './tenancies-list.css',
})
export class TenanciesList {
    private tenanciesApi = inject(TenanciesApi);
    private unitsApi = inject(UnitsApi);
    private tenantsApi = inject(TenantsApi);
    private agentsApi = inject(AgentsApi);

    dataSource: CustomStore = this.tenanciesApi.getStore();

    unitsData: CustomStore = this.unitsApi.getStore();
    tenantsData: CustomStore = this.tenantsApi.getStore();
    agentsData: CustomStore = this.agentsApi.getStore();

    billingCycles = [
        'Monthly',
        'Quarterly',
        'Annually',
    ];

    statuses = [
        'Draft',
        'Active',
        'Ended',
    ];

    tenantDisplay = (tenant: any) =>
        tenant ? `${tenant.fname} ${tenant.lname}` : '';

    agentDisplay = (agent: any) =>
        agent ? `${agent.fname} ${agent.lname}` : '';
}