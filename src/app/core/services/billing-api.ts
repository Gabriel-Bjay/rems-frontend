import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export type InvoiceStatus = 'unpaid' | 'partially_paid' | 'paid' | 'overdue' | 'void';
export type PaymentStatus = 'unmatched' | 'completed' | 'reversed';
export type PaymentMethod = 'cash' | 'bank' | 'mpesa' | 'card';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Invoice {
    id: number;
    tenancy_id: number;
    tenant_id: number;
    tenant_fname: string;
    tenant_lname: string;
    unit_name: string;
    property_name: string;
    period_start: string;
    period_end: string;
    issue_date: string;
    due_date: string;
    total_amount: number;
    amount_paid: number;
    balance: number;
    status: InvoiceStatus;
    void_reason: string | null;
    items?: { id: number; description: string; amount: number | string; source: string }[];
    allocations?: {
        id: number;
        payment_id: number;
        amount_applied: number | string;
        method: PaymentMethod;
        paid_at: string;
        gateway_reference: string | null;
    }[];
}

export interface Payment {
    id: number;
    tenant_id: number | null;
    tenancy_id: number | null;
    tenant_fname: string | null;
    tenant_lname: string | null;
    unit_name: string | null;
    amount: number;
    allocated: number;
    method: PaymentMethod;
    paid_at: string;
    gateway_reference: string | null;
    status: PaymentStatus;
    applied?: { allocated: number; unallocated: number; invoices: number };
    allocations?: {
        id: number;
        invoice_id: number;
        amount_applied: number | string;
        period_start: string;
        period_end: string;
        invoice_status: InvoiceStatus;
    }[];
}

export interface UnitOption {
    id: number;
    name: string;
    status: string;
    property_name: string;
    tenant_fname: string | null;
    tenant_lname: string | null;
}

export interface AppNotification {
    id: number;
    event_type: string;
    message: string;
    related_url: string | null;
    is_read: boolean | number;
    created_at: string;
}

// PostgreSQL returns numeric columns as strings; the grids sort and sum numbers.
const toInvoice = (row: Invoice): Invoice => ({
    ...row,
    total_amount: Number(row.total_amount),
    amount_paid: Number(row.amount_paid),
    balance: Number(row.balance),
});

const toPayment = (row: Payment): Payment => ({
    ...row,
    amount: Number(row.amount),
    allocated: Number(row.allocated ?? 0),
});

export interface NewPayment {
    tenancy_id: number | null;
    amount: number;
    method: PaymentMethod;
    gateway_reference?: string | null;
    paid_at?: string | null;
}

export interface Ticket {
    id: number;
    unit_id: number;
    tenancy_id: number | null;
    title: string;
    description: string | null;
    status: TicketStatus;
    repair_cost: number | string | null;
    resolved_at: string | null;
    created_at: string;
    unit_name: string;
    property_name: string;
    agent_fname: string | null;
    agent_lname: string | null;
    tenant_fname: string | null;
    tenant_lname: string | null;
}

export interface TenancyOption {
    id: number;
    status: string;
    unit_id: number;
    unit_name: string;
    property_name: string;
    tenant_fname: string;
    tenant_lname: string;
    base_rent: number | string;
}

export interface Agent {
    id: number;
    fname: string;
    lname: string;
}

/** Billing, payments and maintenance calls that go beyond plain grid CRUD. */
@Injectable({ providedIn: 'root' })
export class BillingApi {
    private http = inject(HttpClient);
    private api = environment.apiUrl;

    async invoices(status?: InvoiceStatus | null): Promise<Invoice[]> {
        const params = status ? new HttpParams().set('status', status) : undefined;
        const rows = await firstValueFrom(this.http.get<Invoice[]>(`${this.api}/invoices`, { params }));
        return rows.map(toInvoice);
    }

    async invoice(id: number): Promise<Invoice> {
        return toInvoice(await firstValueFrom(this.http.get<Invoice>(`${this.api}/invoices/${id}`)));
    }

    generateInvoices(): Promise<{ created: number }> {
        return firstValueFrom(this.http.post<{ created: number }>(`${this.api}/invoices/generate`, {}));
    }

    async voidInvoice(id: number, reason: string): Promise<Invoice> {
        return toInvoice(await firstValueFrom(this.http.post<Invoice>(`${this.api}/invoices/${id}/void`, { reason })));
    }

    async payments(): Promise<Payment[]> {
        const rows = await firstValueFrom(this.http.get<Payment[]>(`${this.api}/payments`));
        return rows.map(toPayment);
    }

    async payment(id: number): Promise<Payment> {
        return toPayment(await firstValueFrom(this.http.get<Payment>(`${this.api}/payments/${id}`)));
    }

    recordPayment(payment: NewPayment): Promise<Payment> {
        return firstValueFrom(this.http.post<Payment>(`${this.api}/payments`, payment));
    }

    confirmPayment(id: number): Promise<Payment> {
        return firstValueFrom(this.http.post<Payment>(`${this.api}/payments/${id}/confirm`, {}));
    }

    tickets(): Promise<Ticket[]> {
        return firstValueFrom(this.http.get<Ticket[]>(`${this.api}/maintenance-tickets`));
    }

    raiseTicket(ticket: { unit_id: number; title: string; description?: string }): Promise<Ticket> {
        return firstValueFrom(this.http.post<Ticket>(`${this.api}/maintenance-tickets`, ticket));
    }

    /** Agents are always assigned themselves; admins pass the agent to hand it to. */
    assignTicket(id: number, agentId?: number | null): Promise<Ticket> {
        return firstValueFrom(this.http.post<Ticket>(`${this.api}/maintenance-tickets/${id}/assign`, { agent_id: agentId ?? null }));
    }

    resolveTicket(id: number, repairCost: number | null): Promise<Ticket> {
        return firstValueFrom(this.http.post<Ticket>(`${this.api}/maintenance-tickets/${id}/resolve`, { repair_cost: repairCost }));
    }

    tenancies(): Promise<TenancyOption[]> {
        return firstValueFrom(this.http.get<TenancyOption[]>(`${this.api}/tenancies`));
    }

    agents(): Promise<Agent[]> {
        return firstValueFrom(this.http.get<Agent[]>(`${this.api}/agents`));
    }

    units(): Promise<UnitOption[]> {
        return firstValueFrom(this.http.get<UnitOption[]>(`${this.api}/units`));
    }

    notifications(): Promise<AppNotification[]> {
        return firstValueFrom(this.http.get<AppNotification[]>(`${this.api}/notifications`));
    }

    markNotificationRead(id: number): Promise<unknown> {
        return firstValueFrom(this.http.post(`${this.api}/notifications/${id}/mark-read`, {}));
    }

    markAllNotificationsRead(): Promise<unknown> {
        return firstValueFrom(this.http.post(`${this.api}/notifications/mark-all-read`, {}));
    }
}

/** Laravel validation and domain errors arrive as {message, errors?}. */
export const errorMessage = (error: any, fallback: string): string => {
    const body = error?.error;
    const firstField = body?.errors ? Object.values(body.errors)[0] : null;
    return (Array.isArray(firstField) ? firstField[0] : null) ?? body?.message ?? fallback;
};
