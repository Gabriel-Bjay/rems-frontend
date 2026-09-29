import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    DxButtonModule, DxCheckBoxModule, DxDataGridModule, DxDateBoxModule, DxNumberBoxModule,
    DxPopupModule, DxSelectBoxModule, DxTextBoxModule,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';

import { Auth } from '../../../core/services/auth';
import {
    BillingApi, Payment, PaymentMethod, PaymentStatus, TenancyOption, errorMessage,
} from '../../../core/services/billing-api';
import {
    METHOD_LABELS, asDate, inThisMonth, initials, invoiceNo, money, period, personName, shortDate, timeOf,
} from '../../../core/utils/format';

type Filter = 'all' | PaymentStatus;

const FILTERS: { value: Filter; text: string }[] = [
    { value: 'all', text: 'All' },
    { value: 'unmatched', text: 'To confirm' },
    { value: 'completed', text: 'Received' },
    { value: 'reversed', text: 'Reversed' },
];

const STATUS_TEXT: Record<PaymentStatus, string> = {
    unmatched: 'To confirm',
    completed: 'Received',
    reversed: 'Reversed',
};

interface PaymentForm {
    tenancyId: number | null;
    amount: number | null;
    method: PaymentMethod;
    reference: string;
    paidAt: Date;
    confirmNow: boolean;
}

@Component({
    selector: 'app-payments-list',
    standalone: true,
    imports: [
        FormsModule, DxButtonModule, DxCheckBoxModule, DxDataGridModule, DxDateBoxModule,
        DxNumberBoxModule, DxPopupModule, DxSelectBoxModule, DxTextBoxModule,
    ],
    templateUrl: './payments-list.html',
    styleUrl: './payments-list.css',
})
export class PaymentsList implements OnInit {
    private billing = inject(BillingApi);
    private auth = inject(Auth);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    payments = signal<Payment[]>([]);
    loading = signal(true);
    filter = signal<Filter>('all');
    confirming = signal<number | null>(null);

    selected = signal<Payment | null>(null);
    detailLoading = signal(false);

    formOpen = signal(false);
    saving = signal(false);
    tenancies = signal<TenancyOption[]>([]);
    form: PaymentForm = this.blankForm();

    readonly filters = FILTERS;
    readonly methods = Object.entries(METHOD_LABELS).map(([value, text]) => ({ value, text }));
    readonly today = new Date();

    isStaff = computed(() => this.auth.isAdmin() || this.auth.isAgent());
    isTenant = computed(() => this.auth.isTenant() && !this.isStaff() && !this.auth.isOwner());
    canRecord = computed(() => this.isStaff() || this.isTenant());

    counts = computed(() => {
        const rows = this.payments();
        return Object.fromEntries(
            FILTERS.map(f => [f.value, f.value === 'all' ? rows.length : rows.filter(row => row.status === f.value).length]),
        ) as Record<Filter, number>;
    });

    rows = computed(() => {
        const filter = this.filter();
        return filter === 'all' ? this.payments() : this.payments().filter(row => row.status === filter);
    });

    stats = computed(() => {
        const rows = this.payments();
        const received = rows.filter(row => row.status === 'completed' && inThisMonth(row.paid_at));
        const waiting = rows.filter(row => row.status === 'unmatched');
        const credit = rows
            .filter(row => row.status === 'completed')
            .reduce((sum, row) => sum + Math.max(row.amount - row.allocated, 0), 0);
        return {
            received: received.reduce((sum, row) => sum + row.amount, 0),
            receivedCount: received.length,
            waiting: waiting.reduce((sum, row) => sum + row.amount, 0),
            waitingCount: waiting.length,
            credit,
        };
    });

    readonly money = money;
    readonly shortDate = shortDate;
    readonly timeOf = timeOf;
    readonly period = period;
    readonly initials = initials;
    readonly invoiceNo = invoiceNo;
    readonly personName = personName;
    readonly methodLabel = (method: string) => METHOD_LABELS[method] ?? method;
    readonly statusText = (status: PaymentStatus) => STATUS_TEXT[status] ?? status;

    readonly paidAtOf = (row: Payment) => asDate(row.paid_at);
    readonly tenantOf = (row: Payment) => personName(row.tenant_fname, row.tenant_lname);
    readonly methodOf = (row: Payment) => `${METHOD_LABELS[row.method] ?? row.method} ${row.gateway_reference ?? ''}`;
    readonly statusOf = (row: Payment) => STATUS_TEXT[row.status] ?? row.status;
    readonly moneyText = (cell: { value?: unknown }) => money(cell.value as number);
    readonly tenancyText = (t: TenancyOption | null) =>
        t ? `${personName(t.tenant_fname, t.tenant_lname)} — ${t.unit_name}, ${t.property_name}` : '';

    ngOnInit() {
        const params = this.route.snapshot.queryParamMap;
        const status = params.get('status') as Filter | null;
        if (status && FILTERS.some(f => f.value === status)) {
            this.filter.set(status);
        }
        this.load();
        if (params.get('record') && this.canRecord()) {
            this.openForm();
        }
    }

    async load() {
        this.loading.set(true);
        try {
            this.payments.set(await this.billing.payments());
        } catch (error) {
            notify(errorMessage(error, 'Could not load payments.'), 'error', 4000);
        } finally {
            this.loading.set(false);
        }
    }

    setFilter(filter: Filter) {
        this.filter.set(filter);
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { status: filter === 'all' ? null : filter, record: null },
            replaceUrl: true,
        });
    }

    async open(row: Payment) {
        this.selected.set(row);
        this.detailLoading.set(true);
        try {
            this.selected.set(await this.billing.payment(row.id));
        } catch (error) {
            notify(errorMessage(error, 'Could not load the payment.'), 'error', 4000);
        } finally {
            this.detailLoading.set(false);
        }
    }

    async confirm(row: Payment, event?: Event) {
        event?.stopPropagation();
        this.confirming.set(row.id);
        try {
            const confirmed = await this.billing.confirmPayment(row.id);
            notify(this.appliedMessage(confirmed), 'success', 4500);
            if (this.selected()?.id === row.id) {
                await this.open(row);
            }
            await this.load();
        } catch (error) {
            notify(errorMessage(error, 'Could not confirm the payment.'), 'error', 4000);
        } finally {
            this.confirming.set(null);
        }
    }

    async openForm() {
        this.form = this.blankForm();
        this.formOpen.set(true);
        try {
            const active = (await this.billing.tenancies()).filter(t => t.status === 'active');
            this.tenancies.set(active);
            if (this.isTenant() && active.length) {
                this.form.tenancyId = active[0].id;
            }
        } catch (error) {
            notify(errorMessage(error, 'Could not load tenancies.'), 'error', 4000);
        }
    }

    async save() {
        const form = this.form;
        if (this.isStaff() && !form.tenancyId) {
            notify('Choose who paid.', 'warning', 3000);
            return;
        }
        if (!form.amount || form.amount <= 0) {
            notify('Enter the amount paid.', 'warning', 3000);
            return;
        }
        if (form.method === 'mpesa' && !form.reference.trim()) {
            notify('Enter the M-Pesa confirmation code, for example QK7X2ZP4TA.', 'warning', 3500);
            return;
        }

        this.saving.set(true);
        try {
            const payment = await this.billing.recordPayment({
                tenancy_id: form.tenancyId,
                amount: form.amount,
                method: form.method,
                gateway_reference: form.reference.trim().toUpperCase() || null,
                paid_at: form.paidAt.toISOString(),
            });

            if (this.isStaff() && form.confirmNow) {
                notify(this.appliedMessage(await this.billing.confirmPayment(payment.id)), 'success', 4500);
            } else if (this.isStaff()) {
                notify('Payment recorded. Confirm it once the money has cleared.', 'success', 3500);
            } else {
                notify('Payment reported. It will reflect on your balance once confirmed.', 'success', 4000);
            }

            this.formOpen.set(false);
            await this.load();
        } catch (error) {
            notify(errorMessage(error, 'Could not save the payment.'), 'error', 4000);
        } finally {
            this.saving.set(false);
        }
    }

    unapplied(row: Payment) {
        return row.status === 'completed' ? Math.max(row.amount - row.allocated, 0) : 0;
    }

    private appliedMessage(payment: Payment) {
        const applied = payment.applied;
        if (!applied || applied.invoices === 0) {
            return `Confirmed. ${money(payment.amount)} is held as credit; nothing was owed.`;
        }
        const credit = applied.unallocated > 0 ? ` ${money(applied.unallocated)} kept as credit.` : '';
        return `Confirmed. ${money(applied.allocated)} applied to ${applied.invoices} invoice${applied.invoices === 1 ? '' : 's'}.${credit}`;
    }

    private blankForm(): PaymentForm {
        return { tenancyId: null, amount: null, method: 'mpesa', reference: '', paidAt: new Date(), confirmNow: true };
    }
}
