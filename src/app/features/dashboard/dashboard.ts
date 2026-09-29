import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
    DxButtonModule, DxChartModule, DxDateBoxModule, DxNumberBoxModule,
    DxPopupModule, DxSelectBoxModule, DxTextAreaModule, DxTextBoxModule,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import type { dxChartPointInfo } from 'devextreme/viz/chart';

import { Auth } from '../../core/services/auth';
import { DashboardApi, DashboardSummary } from '../../core/services/dashboard-api';
import { BillingApi, PaymentMethod, errorMessage } from '../../core/services/billing-api';
import {
    METHOD_LABELS, dayMonth, daysSince, initials, label, money, percent, period, personName, shortDate,
} from '../../core/utils/format';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        FormsModule, RouterLink, DxButtonModule, DxChartModule, DxDateBoxModule, DxNumberBoxModule,
        DxPopupModule, DxSelectBoxModule, DxTextAreaModule, DxTextBoxModule,
    ],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
    private dashboardApi = inject(DashboardApi);
    private billing = inject(BillingApi);
    private auth = inject(Auth);

    data = signal<DashboardSummary | null>(null);
    loading = signal(true);
    failed = signal(false);
    generating = signal(false);

    isStaff = computed(() => this.auth.isAdmin() || this.auth.isAgent());
    isTenantView = computed(() => this.data()?.view === 'tenant');

    greeting = computed(() => {
        const hour = new Date().getHours();
        const part = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
        const first = (this.auth.currentUser()?.name ?? '').split(' ')[0];
        return first ? `${part}, ${first}` : part;
    });

    // Tenant actions
    payOpen = signal(false);
    requestOpen = signal(false);
    saving = signal(false);
    methods = Object.entries(METHOD_LABELS).map(([value, text]) => ({ value, text }));
    payment = { amount: 0, method: 'mpesa' as PaymentMethod, reference: '', paidAt: new Date() };
    request = { title: '', description: '' };

    readonly Math = Math;
    readonly today = new Date();
    readonly money = money;
    readonly percent = percent;
    readonly shortDate = shortDate;
    readonly dayMonth = dayMonth;
    readonly period = period;
    readonly personName = personName;
    readonly initials = initials;
    readonly label = label;
    readonly daysSince = daysSince;
    readonly methodLabel = (method: string) => METHOD_LABELS[method] ?? method;

    readonly axisMoney = ({ value }: { value: string | number | Date }) => {
        const amount = Number(value);
        return amount >= 1_000_000 ? `${amount / 1_000_000}M` : amount >= 1000 ? `${amount / 1000}k` : `${amount}`;
    };
    // The trend chart only has bar series, so every point carries a single value.
    readonly chartTooltip = (point: dxChartPointInfo) => {
        const { argumentText, seriesName, value } = point as { argumentText?: string; seriesName?: string; value?: unknown };
        return { text: `${argumentText} · ${seriesName}: ${money(Number(value))}` };
    };

    ngOnInit() {
        this.load();
    }

    async load() {
        this.loading.set(true);
        this.failed.set(false);
        try {
            this.data.set(await this.dashboardApi.summary());
        } catch {
            this.failed.set(true);
        } finally {
            this.loading.set(false);
        }
    }

    async generateInvoices() {
        this.generating.set(true);
        try {
            const { created } = await this.billing.generateInvoices();
            notify(created
                ? `Issued ${created} new invoice${created === 1 ? '' : 's'}.`
                : 'Every active tenancy is already invoiced for this period.', 'success', 3000);
            await this.load();
        } catch (error) {
            notify(errorMessage(error, 'Could not generate invoices.'), 'error', 4000);
        } finally {
            this.generating.set(false);
        }
    }

    openPayment() {
        const tenant = this.data()?.tenant;
        this.payment = { amount: Number(tenant?.balance ?? 0), method: 'mpesa', reference: '', paidAt: new Date() };
        this.payOpen.set(true);
    }

    async reportPayment() {
        const tenancyId = this.data()?.tenant?.tenancy?.id ?? null;
        if (!this.payment.amount || this.payment.amount <= 0) {
            notify('Enter the amount you paid.', 'warning', 3000);
            return;
        }
        if (this.payment.method === 'mpesa' && !this.payment.reference.trim()) {
            notify('Enter the M-Pesa confirmation code, for example QK7X2ZP4TA.', 'warning', 3500);
            return;
        }
        this.saving.set(true);
        try {
            await this.billing.recordPayment({
                tenancy_id: tenancyId,
                amount: this.payment.amount,
                method: this.payment.method,
                gateway_reference: this.payment.reference.trim().toUpperCase() || null,
                paid_at: this.payment.paidAt.toISOString(),
            });
            this.payOpen.set(false);
            notify('Payment reported. It will reflect on your balance once confirmed.', 'success', 4000);
            await this.load();
        } catch (error) {
            notify(errorMessage(error, 'Could not report the payment.'), 'error', 4000);
        } finally {
            this.saving.set(false);
        }
    }

    openRequest() {
        this.request = { title: '', description: '' };
        this.requestOpen.set(true);
    }

    async raiseRequest() {
        const unitId = this.data()?.tenant?.tenancy?.unit_id;
        if (!unitId || !this.request.title.trim()) {
            notify('Describe the problem in a few words.', 'warning', 3000);
            return;
        }
        this.saving.set(true);
        try {
            await this.billing.raiseTicket({
                unit_id: unitId,
                title: this.request.title.trim(),
                description: this.request.description.trim() || undefined,
            });
            this.requestOpen.set(false);
            notify('Request sent. You will be notified when an agent picks it up.', 'success', 4000);
            await this.load();
        } catch (error) {
            notify(errorMessage(error, 'Could not send the request.'), 'error', 4000);
        } finally {
            this.saving.set(false);
        }
    }
}
