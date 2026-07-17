import { Component, inject } from '@angular/core';
import { DxDataGridModule } from 'devextreme-angular';
import CustomStore from 'devextreme/data/custom_store';
import { AgentsApi } from '../agents-api';

@Component({
    selector: 'app-agents-list',
    standalone: true,
    imports: [DxDataGridModule],
    templateUrl: './agents-list.html',
    styleUrl: './agents-list.css',
})
export class AgentsList {
    private agentsApi = inject(AgentsApi);
    dataSource: CustomStore = this.agentsApi.getStore();
}