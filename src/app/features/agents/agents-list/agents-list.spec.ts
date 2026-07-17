import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentsList } from './agents-list';

describe('AgentsList', () => {
  let component: AgentsList;
  let fixture: ComponentFixture<AgentsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentsList],
    }).compileComponents();

    fixture = TestBed.createComponent(AgentsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
