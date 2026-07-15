import { Component, inject } from '@angular/core';
import { DxDataGridModule } from 'devextreme-angular';
import CustomStore from 'devextreme/data/custom_store';
import { PropertiesApi } from '../properties-api';
import { OwnersApi } from '../../owners/owners-api';

@Component({
    selector: 'app-properties-list',
    standalone: true,
    imports: [DxDataGridModule],
    templateUrl: './properties-list.html',
    styleUrl: './properties-list.css',
})
export class PropertiesList {
    private propertiesApi = inject(PropertiesApi);
    private ownersApi = inject(OwnersApi);

    dataSource: CustomStore = this.propertiesApi.getStore();
    ownersData: CustomStore = this.ownersApi.getStore();

    ownerDisplay = (owner: any) => (owner ? `${owner.fname} ${owner.lname}` : '');
}