import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantsList } from './tenants-list';

describe('TenantsList', () => {
  let component: TenantsList;
  let fixture: ComponentFixture<TenantsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantsList],
    }).compileComponents();

    fixture = TestBed.createComponent(TenantsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
