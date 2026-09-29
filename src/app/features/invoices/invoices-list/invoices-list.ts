import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DxButtonModule, DxDataGridModule, DxPopupModule, DxTextAreaModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';

import { Auth } from '../../../core/services/auth';
import { BillingApi, Invoice, InvoiceStatus, errorMessage } from '../../../core/services/billing-api';
import {
    METHOD_LABELS, daysSince, initials, invoiceNo, label, money, period, personName, shortDate,
} from '../../../core/utils/format';

type Filter = 'all' | 'open' | InvoiceStatus;

const OPEN: InvoiceStatus[] = ['unpaid', 'partially_paid', 'overdue'];

const FILTERS: { value: Filter; text: string }[] = [
    { value: 'all', text: 'All' },
    { value: 'open', text: 'Outstanding' },
    { value: 'overdue', text: 'Overdue' },
    { value: 'partially_paid', text: 'Partially paid' },
    { value: 'unpaid', text: 'Unpaid' },
    { value: 'paid', text: 'Paid' },
    { value: 'void', text: 'Void' },
];

const matches = (invoice: Invoice, filter: Filter) =>
    filter === 'all' || (filter === 'open' ? OPEN.includes(invoice.status) : invoice.status === filter);

@Component({
    selector: 'app-invoices-list',
    standalone: true,
    imports: [FormsModule, DxButtonModule, DxDataGridModule, DxPopupModule, DxTextAreaModule],
    templateUrl: './invoices-list.html',
    styleUrl: './invoices-list.css',
})
export class InvoicesList implements OnInit {
    private billing = inject(BillingApi);
    private auth = inject(Auth);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    invoices = signal<Invoice[]>([]);
    loading = signal(true);
    generating = signal(false);
    filter = signal<Filter>('all');

    selected = signal<Invoice | null>(null);
    detailLoading = signal(false);
    voidOpen = signal(false);
    voiding = signal(false);
    voidReason = '';

    readonly filters = FILTERS;
    isStaff = computed(() => this.auth.isAdmin() || this.auth.isAgent());
    isTenant = computed(() => this.auth.isTenant() && !this.isStaff() && !this.auth.isOwner());

    counts = computed(() => {
        const rows = this.invoices();
        return Object.fromEntries(FILTERS.map(f => [f.value, rows.filter(row => matches(row, f.value)).length])) as Record<Filter, number>;
    });

    rows = computed(() => this.invoices().filter(row => matches(row, this.filter())));

    stats = computed(() => {
        const rows = this.invoices();
        const open = rows.filter(row => OPEN.includes(row.status));
        const overdue = rows.filter(row => row.status === 'overdue');
        const now = new Date();
        const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        const thisMonth = rows.filter(row => row.status !== 'void' && row.issue_date >= monthStart);
        const billed = thisMonth.reduce((sum, row) => sum + row.total_amount, 0);
        const paid = thisMonth.reduce((sum, row) => sum + row.amount_paid, 0);
        return {
            outstanding: open.reduce((sum, row) => sum + row.balance, 0),
            openCount: open.length,
            overdue: overdue.reduce((sum, row) => sum + row.balance, 0),
            overdueCount: overdue.length,
            billed,
            paidShare: billed ? Math.round((paid / billed) * 100) : null,
            monthCount: thisMonth.length,
        };
    });

    readonly money = money;
    readonly shortDate = shortDate;
    readonly period = period;
    readonly personName = personName;
    readonly initials = initials;
    readonly label = label;
    readonly invoiceNo = invoiceNo;
    readonly methodLabel = (method: string) => METHOD_LABELS[method] ?? method;

    // Grid helpers: computed values keep the search panel and sorting on what is shown.
    readonly numberOf = (row: Invoice) => invoiceNo(row.id);
    readonly tenantOf = (row: Invoice) => personName(row.tenant_fname, row.tenant_lname);
    readonly unitOf = (row: Invoice) => `${row.unit_name} · ${row.property_name}`;
    readonly periodOf = (row: Invoice) => period(row.period_start);
    readonly statusOf = (row: Invoice) => label(row.status);
    readonly moneyText = (cell: { value?: unknown }) => money(cell.value as number);
    readonly daysLate = (row: Invoice) => (row.status === 'overdue' ? daysSince(row.due_date) : 0);

    constructor() {
        // Notification links can land here while the page is already open, so follow the query string.
        this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(params => {
            const invoiceId = Number(params.get('invoice'));
            if (invoiceId && this.selected()?.id !== invoiceId) {
                this.openById(invoiceId);
            }
        });
    }

    ngOnInit() {
        const status = this.route.snapshot.queryParamMap.get('status') as Filter | null;
        if (status && FILTERS.some(f => f.value === status)) {
            this.filter.set(status);
        }
        this.load();
    }

    async load() {
        this.loading.set(true);
        try {
            this.invoices.set(await this.billing.invoices());
        } catch (error) {
            notify(errorMessage(error, 'Could not load invoices.'), 'error', 4000);
        } finally {
            this.loading.set(false);
        }
    }

    setFilter(filter: Filter) {
        this.filter.set(filter);
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { status: filter === 'all' ? null : filter },
            replaceUrl: true,
        });
    }

    async open(row: Invoice) {
        this.selected.set(row);
        this.voidOpen.set(false);
        this.detailLoading.set(true);
        try {
            this.selected.set(await this.billing.invoice(row.id));
        } catch (error) {
            notify(errorMessage(error, 'Could not load the invoice.'), 'error', 4000);
        } finally {
            this.detailLoading.set(false);
        }
    }

    /** Deep link from a notification: show the popup once the invoice has loaded. */
    async openById(id: number) {
        this.detailLoading.set(true);
        try {
            this.selected.set(await this.billing.invoice(id));
        } catch (error) {
            notify(errorMessage(error, 'Could not load the invoice.'), 'error', 4000);
        } finally {
            this.detailLoading.set(false);
        }
    }

    close() {
        this.selected.set(null);
        this.voidOpen.set(false);
        if (this.route.snapshot.queryParamMap.has('invoice')) {
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { invoice: null },
                queryParamsHandling: 'merge',
                replaceUrl: true,
            });
        }
    }

    canVoid(invoice: Invoice) {
        return this.isStaff() && invoice.status !== 'void' && invoice.amount_paid === 0;
    }

    async generate() {
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

    startVoid() {
        this.voidReason = '';
        this.voidOpen.set(true);
    }

    async confirmVoid() {
        const invoice = this.selected();
        if (!invoice || !this.voidReason.trim()) {
            notify('Say why the invoice is being voided.', 'warning', 3000);
            return;
        }
        this.voiding.set(true);
        try {
            await this.billing.voidInvoice(invoice.id, this.voidReason.trim());
            notify(`${invoiceNo(invoice.id)} voided.`, 'success', 3000);
            this.close();
            await this.load();
        } catch (error) {
            notify(errorMessage(error, 'Could not void the invoice.'), 'error', 4000);
        } finally {
            this.voiding.set(false);
        }
    }
}
