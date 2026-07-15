import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitsList } from './units-list';

describe('UnitsList', () => {
  let component: UnitsList;
  let fixture: ComponentFixture<UnitsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitsList],
    }).compileComponents();

    fixture = TestBed.createComponent(UnitsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
