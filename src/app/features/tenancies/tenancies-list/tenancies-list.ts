import { Component, ViewChild, computed, inject } from '@angular/core';
import { DxDataGridComponent, DxDataGridModule } from 'devextreme-angular';
import CustomStore from 'devextreme/data/custom_store';
import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';

import { TenanciesApi } from '../tenancies-api';
import { UnitsApi } from '../../units/units-api';
import { TenantsApi } from '../../tenants/tenants-api';
import { AgentsApi } from '../../agents/agents-api';
import { Auth } from '../../../core/services/auth';
import { errorMessage } from '../../../core/services/billing-api';
import { label, money, personName } from '../../../core/utils/format';

interface TenancyRow {
    id: number;
    status: 'draft' | 'active' | 'ended';
    tenant_fname: string;
    tenant_lname: string;
    unit_name: string;
    property_name: string;
    base_rent: number | string;
}

type RowEvent = { row?: { data: TenancyRow } };

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
    private auth = inject(Auth);

    @ViewChild(DxDataGridComponent) grid?: DxDataGridComponent;

    dataSource: CustomStore = this.tenanciesApi.getStore();

    unitsData: CustomStore = this.unitsApi.getStore();
    tenantsData: CustomStore = this.tenantsApi.getStore();
    agentsData: CustomStore = this.agentsApi.getStore();

    // Owners can look; only admins and agents change leases.
    isStaff = computed(() => this.auth.isAdmin() || this.auth.isAgent());

    billingCycles = [
        'monthly',
        'quarterly',
        'annually',
    ];

    statuses = [
        'draft',
        'active',
        'ended',
    ];

    readonly label = label;

    tenantDisplay = (tenant: any) =>
        tenant ? `${tenant.fname} ${tenant.lname}` : '';

    agentDisplay = (agent: any) =>
        agent ? `${agent.fname} ${agent.lname}` : '';

    readonly canActivate = (e: RowEvent) => this.isStaff() && e.row?.data.status === 'draft';
    readonly canEnd = (e: RowEvent) => this.isStaff() && e.row?.data.status === 'active';

    readonly activate = async (e: RowEvent) => {
        const row = e.row?.data;
        if (!row) return;
        const ok = await confirm(
            `Start ${this.who(row)}'s lease? This opens a deposit of ${money(row.base_rent)} and issues the first invoice.`,
            'Activate tenancy',
        );
        if (!ok) return;
        try {
            await this.tenanciesApi.activate(row.id);
            notify(`Tenancy active. ${row.unit_name} is now occupied and the first invoice is out.`, 'success', 4000);
            this.grid?.instance.refresh();
        } catch (error) {
            notify(errorMessage(error, 'Could not activate the tenancy.'), 'error', 4000);
        }
    };

    readonly end = async (e: RowEvent) => {
        const row = e.row?.data;
        if (!row) return;
        const ok = await confirm(
            `End ${this.who(row)}'s lease? ${row.unit_name} becomes vacant. Anything still owed stays on their account.`,
            'End tenancy',
        );
        if (!ok) return;
        try {
            await this.tenanciesApi.end(row.id);
            notify(`Tenancy ended. ${row.unit_name} is vacant again.`, 'success', 4000);
            this.grid?.instance.refresh();
        } catch (error) {
            notify(errorMessage(error, 'Could not end the tenancy.'), 'error', 4000);
        }
    };

    private who(row: TenancyRow) {
        return `${personName(row.tenant_fname, row.tenant_lname)} at ${row.unit_name}, ${row.property_name}`;
    }
}
