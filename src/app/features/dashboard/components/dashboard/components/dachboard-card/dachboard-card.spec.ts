import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DachboardCard } from './dachboard-card';

describe('DachboardCard', () => {
  let component: DachboardCard;
  let fixture: ComponentFixture<DachboardCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DachboardCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DachboardCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
