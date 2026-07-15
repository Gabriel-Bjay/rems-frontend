import { Component, inject } from '@angular/core';
import { DxDataGridModule, DxButtonModule } from 'devextreme-angular';
import CustomStore from 'devextreme/data/custom_store';
import { OwnersApi } from '../owners-api';
import { Router } from '@angular/router';

@Component({
    selector: 'app-owners-list',
    standalone: true,
    imports: [DxDataGridModule, DxButtonModule],
    templateUrl: './owners-list.html',
    styleUrl: './owners-list.css',
})
export class OwnersList {
    private ownersApi = inject(OwnersApi);
    private router = inject(Router)
    dataSource: CustomStore = this.ownersApi.getStore();

    goToDash(){
      this.router.navigate(['/dashboard'])
    }
}