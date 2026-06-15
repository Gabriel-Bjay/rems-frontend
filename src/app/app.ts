import { Component } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';

@Component({
  selector: 'app-root',
  imports: [DxButtonModule],
  template: `
    <div style="padding: 40px;">
      <h1>REMS Frontend</h1>
      <dx-button
        text="DevExtreme is working"
        type="default"
        (onClick)="clicked()">
      </dx-button>
    </div>
  `,
})
export class App {
  clicked() {
    alert('Setup complete!');
  }
}