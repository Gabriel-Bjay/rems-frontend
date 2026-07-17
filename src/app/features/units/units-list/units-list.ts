import { Component, inject } from '@angular/core';
import { DxDataGridModule } from 'devextreme-angular';
import CustomStore from 'devextreme/data/custom_store';
import { UnitsApi } from '../units-api';
import { PropertiesApi } from '../../properties/properties-api';
import { AgentsApi } from '../../agents/agents-api';

@Component({
    selector: 'app-units-list',
    standalone: true,
    imports: [DxDataGridModule],
    templateUrl: './units-list.html',
    styleUrl: './units-list.css',
})
export class UnitsList {
    private unitsApi = inject(UnitsApi);
    private propertiesApi = inject(PropertiesApi);
    private agentsApi = inject(AgentsApi)

    dataSource: CustomStore = this.unitsApi.getStore();
    propertiesData: CustomStore = this.propertiesApi.getStore();
    agentsData: CustomStore = this.agentsApi.getStore();

    statuses = ['vacant', 'occupied', 'under_maintenance'];
    agentDisplay = (agent:any) => (agent ? `${agent.fname} ${agent.lname}`: '');
}