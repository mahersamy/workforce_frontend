import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusCell } from './status-cell';

describe('StatusCell', () => {
  let component: StatusCell;
  let fixture: ComponentFixture<StatusCell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusCell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusCell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
