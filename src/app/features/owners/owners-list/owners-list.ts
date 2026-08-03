import { Component, inject } from '@angular/core';
import { DxDataGridModule, DxButtonModule } from 'devextreme-angular';
import CustomStore from 'devextreme/data/custom_store';
import { OwnersApi } from '../owners-api';

@Component({
    selector: 'app-owners-list',
    standalone: true,
    imports: [DxDataGridModule, DxButtonModule],
    templateUrl: './owners-list.html',
    styleUrl: './owners-list.css',
})
export class OwnersList {
    private ownersApi = inject(OwnersApi);
    dataSource: CustomStore = this.ownersApi.getStore();

}