import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PropertiesApi } from '../properties/properties-api';
import { UnitsApi } from '../units/units-api';
import { TenantsApi } from '../tenants/tenants-api';
// import { TenanciesApi } from '../tenancies/tenancies-api';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
    private propertiesApi = inject(PropertiesApi);
    private unitsApi = inject(UnitsApi);
    private tenantsApi = inject(TenantsApi);
    // private tenanciesApi = inject(TenanciesApi);

    loading = signal(true);
    private properties = signal<any[]>([]);
    private units = signal<any[]>([]);
    private tenants = signal<any[]>([]);
    // private tenancies = signal<any[]>([]);

    propertyCount = computed(() => this.properties().length);
    unitCount = computed(() => this.units().length);
    tenantCount = computed(() => this.tenants().length);

    vacantCount = computed(() => this.units().filter((u) => u.status === 'vacant').length);
    occupiedCount = computed(() => this.units().filter((u) => u.status === 'occupied').length);
    maintenanceCount = computed(() => this.units().filter((u) => u.status === 'under_maintenance').length);

    // activeTenancyCount = computed(() => this.tenancies().filter((t) => t.status === 'active').length);

    private unitNames = computed(() => {
        const map = new Map<number, string>();
        for (const u of this.units()) map.set(u.id, u.name);
        return map;
    });
    private tenantNames = computed(() => {
        const map = new Map<number, string>();
        for (const t of this.tenants()) map.set(t.id, `${t.fname} ${t.lname}`);
        return map;
    });

    // Five most recent tenancies, with names filled in.
    recentTenancies = computed(() => {
        const units = this.unitNames();
        const tenants = this.tenantNames();
        return
        //  [...this.tenancies()]
        //     .sort((a, b) => (b.start_date ?? '').localeCompare(a.start_date ?? ''))
        //     .slice(0, 5)
        //     .map((t) => ({
        //         id: t.id,
        //         unit: units.get(t.unit_id) ?? 'Unknown unit',
        //         tenant: tenants.get(t.tenant_id) ?? 'Unknown tenant',
        //         start_date: t.start_date,
        //         status: t.status,
        //     }));
    });

    async ngOnInit() {
        try {
            // Fetch all lists at the same time instead of one after another.
            const [properties, units, tenants] = await Promise.all([
                this.propertiesApi.getStore().load(),
                this.unitsApi.getStore().load(),
                this.tenantsApi.getStore().load(),
                // this.tenanciesApi.getStore().load(),
            ]);
            this.properties.set(properties as any[]);
            this.units.set(units as any[]);
            this.tenants.set(tenants as any[]);
            // this.tenancies.set(tenancies as any[]);
        } finally {
            this.loading.set(false);
        }
    }
}