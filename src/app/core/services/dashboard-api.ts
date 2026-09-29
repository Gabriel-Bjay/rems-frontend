import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardSummary {
    view: 'admin' | 'agent' | 'owner' | 'tenant' | 'none';
    portfolio: {
        properties: number;
        units: number;
        occupied: number;
        vacant: number;
        under_maintenance: number;
        occupancy_rate: number | null;
        active_tenancies: number;
        rent_roll: number;
    };
    finance: {
        billed_this_month: number;
        collected_this_month: number;
        collection_rate: number | null;
        outstanding: number;
        overdue_count: number;
        overdue_amount: number;
        pending_confirmations: number;
    };
    trend: { month: string; label: string; billed: number; collected: number }[];
    expiring_leases: {
        id: number;
        end_date: string;
        days_left: number;
        tenant_fname: string;
        tenant_lname: string;
        unit_name: string;
        property_name: string;
    }[];
    arrears: {
        tenancy_id: number;
        tenant_id: number;
        tenant_fname: string;
        tenant_lname: string;
        unit_name: string;
        balance: number | string;
        oldest_due: string;
        invoices: number;
    }[];
    recent_payments: {
        id: number;
        amount: number | string;
        method: string;
        status: string;
        paid_at: string;
        gateway_reference: string | null;
        tenant_fname: string | null;
        tenant_lname: string | null;
        unit_name: string | null;
    }[];
    maintenance: {
        open: number;
        in_progress: number;
        resolved: number;
        recent: { id: number; title: string; status: string; created_at: string; unit_name: string }[];
    };
    tenant: {
        tenancy: {
            id: number;
            status: string;
            start_date: string;
            end_date: string | null;
            billing_cycle: string;
            unit_id: number;
            unit_name: string;
            base_rent: number | string;
            property_name: string;
            address: string;
        } | null;
        balance: number;
        next_due: { id: number; due_date: string; period_start: string; status: string; balance: number | string } | null;
        deposit: { amount_required: number | string; amount_held: number | string; status: string } | null;
    } | null;
}

@Injectable({ providedIn: 'root' })
export class DashboardApi {
    private http = inject(HttpClient);

    summary(): Promise<DashboardSummary> {
        return firstValueFrom(this.http.get<DashboardSummary>(`${environment.apiUrl}/dashboard`));
    }
}
