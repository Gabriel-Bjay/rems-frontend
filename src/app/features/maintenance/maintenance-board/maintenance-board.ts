import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    DxButtonModule, DxNumberBoxModule, DxPopupModule, DxSelectBoxModule, DxTextAreaModule, DxTextBoxModule,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';

import { Auth } from '../../../core/services/auth';
import { Agent, BillingApi, Ticket, UnitOption, errorMessage } from '../../../core/services/billing-api';
import { asDate, daysSince, inThisMonth, money, personName, shortDate, timeAgo } from '../../../core/utils/format';

type Lane = 'open' | 'in_progress' | 'done';

const DAY = 86_400_000;
const time = (value: string | null) => asDate(value)?.getTime() ?? 0;

@Component({
    selector: 'app-maintenance-board',
    standalone: true,
    imports: [
        FormsModule, DxButtonModule, DxNumberBoxModule, DxPopupModule, DxSelectBoxModule, DxTextAreaModule, DxTextBoxModule,
    ],
    templateUrl: './maintenance-board.html',
    styleUrl: './maintenance-board.css',
})
export class MaintenanceBoard implements OnInit {
    private billing = inject(BillingApi);
    private auth = inject(Auth);

    tickets = signal<Ticket[]>([]);
    loading = signal(true);
    busy = signal<number | null>(null);

    agents = signal<Agent[]>([]);
    assignFor = signal<Ticket | null>(null);
    assignAgentId: number | null = null;

    resolveFor = signal<Ticket | null>(null);
    repairCost: number | null = null;

    raiseOpen = signal(false);
    saving = signal(false);
    units = signal<UnitOption[]>([]);
    tenantHome = signal<{ unitId: number; label: string } | null>(null);
    raise = { unitId: null as number | null, title: '', description: '' };

    isAdmin = this.auth.isAdmin;
    isStaff = computed(() => this.auth.isAdmin() || this.auth.isAgent());
    isTenant = computed(() => this.auth.isTenant() && !this.isStaff() && !this.auth.isOwner());

    lanes = computed(() => {
        const rows = this.tickets();
        const byAge = (a: Ticket, b: Ticket) => time(a.created_at) - time(b.created_at);
        return [
            {
                key: 'open' as Lane,
                title: 'Open',
                hint: 'Waiting for an agent',
                items: rows.filter(t => t.status === 'open').sort(byAge),
            },
            {
                key: 'in_progress' as Lane,
                title: 'In progress',
                hint: 'Someone is on it',
                items: rows.filter(t => t.status === 'in_progress').sort(byAge),
            },
            {
                key: 'done' as Lane,
                title: 'Resolved',
                hint: 'Fixed and closed',
                items: rows
                    .filter(t => t.status === 'resolved' || t.status === 'closed')
                    .sort((a, b) => time(b.resolved_at ?? b.created_at) - time(a.resolved_at ?? a.created_at)),
            },
        ];
    });

    stats = computed(() => {
        const rows = this.tickets();
        const waiting = rows.filter(t => t.status === 'open' || t.status === 'in_progress');
        const resolved = rows.filter(t => (t.status === 'resolved' || t.status === 'closed') && t.resolved_at);
        const avgDays = resolved.length
            ? resolved.reduce((sum, t) => sum + (time(t.resolved_at) - time(t.created_at)) / DAY, 0) / resolved.length
            : null;
        const costThisMonth = resolved
            .filter(t => inThisMonth(t.resolved_at))
            .reduce((sum, t) => sum + Number(t.repair_cost ?? 0), 0);
        return {
            waiting: waiting.length,
            oldest: waiting.length ? Math.max(...waiting.map(t => daysSince(t.created_at))) : 0,
            avgDays: avgDays === null ? null : Math.max(avgDays, 0).toFixed(1),
            costThisMonth,
        };
    });

    readonly money = money;
    readonly shortDate = shortDate;
    readonly timeAgo = timeAgo;
    readonly daysSince = daysSince;
    readonly personName = personName;
    readonly agentText = (agent: Agent | null) => (agent ? `${agent.fname} ${agent.lname}` : '');
    readonly unitText = (unit: UnitOption | null) => {
        if (!unit) return '';
        const tenant = personName(unit.tenant_fname, unit.tenant_lname);
        return `${unit.name} · ${unit.property_name}${tenant !== '—' ? ` (${tenant})` : ''}`;
    };

    ngOnInit() {
        this.load();
    }

    async load() {
        this.loading.set(true);
        try {
            this.tickets.set(await this.billing.tickets());
        } catch (error) {
            notify(errorMessage(error, 'Could not load maintenance requests.'), 'error', 4000);
        } finally {
            this.loading.set(false);
        }
    }

    // Admins choose the agent; an agent picks the ticket up themselves.
    async startAssign(ticket: Ticket) {
        if (!this.isAdmin()) {
            await this.assign(ticket, null);
            return;
        }
        this.assignAgentId = null;
        this.assignFor.set(ticket);
        if (!this.agents().length) {
            try {
                this.agents.set(await this.billing.agents());
            } catch (error) {
                notify(errorMessage(error, 'Could not load agents.'), 'error', 4000);
            }
        }
    }

    async assign(ticket: Ticket, agentId: number | null) {
        if (this.isAdmin() && !agentId) {
            notify('Choose an agent.', 'warning', 3000);
            return;
        }
        this.busy.set(ticket.id);
        try {
            const updated = await this.billing.assignTicket(ticket.id, agentId);
            notify(`Assigned to ${personName(updated.agent_fname, updated.agent_lname)}.`, 'success', 3000);
            this.assignFor.set(null);
            await this.load();
        } catch (error) {
            notify(errorMessage(error, 'Could not assign the ticket.'), 'error', 4000);
        } finally {
            this.busy.set(null);
        }
    }

    startResolve(ticket: Ticket) {
        this.repairCost = null;
        this.resolveFor.set(ticket);
    }

    async resolve() {
        const ticket = this.resolveFor();
        if (!ticket) return;
        this.busy.set(ticket.id);
        try {
            await this.billing.resolveTicket(ticket.id, this.repairCost);
            notify(`"${ticket.title}" marked as resolved.`, 'success', 3000);
            this.resolveFor.set(null);
            await this.load();
        } catch (error) {
            notify(errorMessage(error, 'Could not resolve the ticket.'), 'error', 4000);
        } finally {
            this.busy.set(null);
        }
    }

    async openRaise() {
        this.raise = { unitId: null, title: '', description: '' };
        this.raiseOpen.set(true);
        try {
            if (this.isTenant()) {
                const home = (await this.billing.tenancies()).find(t => t.status === 'active');
                this.tenantHome.set(home ? { unitId: home.unit_id, label: `${home.unit_name}, ${home.property_name}` } : null);
                this.raise.unitId = home?.unit_id ?? null;
            } else if (!this.units().length) {
                this.units.set(await this.billing.units());
            }
        } catch (error) {
            notify(errorMessage(error, 'Could not load units.'), 'error', 4000);
        }
    }

    async submitRaise() {
        if (!this.raise.unitId) {
            notify(this.isTenant() ? 'You need an active tenancy to raise a request.' : 'Choose the unit.', 'warning', 3000);
            return;
        }
        if (!this.raise.title.trim()) {
            notify('Describe the problem in a few words.', 'warning', 3000);
            return;
        }
        this.saving.set(true);
        try {
            await this.billing.raiseTicket({
                unit_id: this.raise.unitId,
                title: this.raise.title.trim(),
                description: this.raise.description.trim() || undefined,
            });
            notify(this.isTenant()
                ? 'Request sent. You will be notified when an agent picks it up.'
                : 'Request added to the board.', 'success', 3500);
            this.raiseOpen.set(false);
            await this.load();
        } catch (error) {
            notify(errorMessage(error, 'Could not raise the request.'), 'error', 4000);
        } finally {
            this.saving.set(false);
        }
    }
}
