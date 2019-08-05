import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PoolStatsComponent } from './pool-stats.component';

describe('PoolStatsComponent', () => {
  let component: PoolStatsComponent;
  let fixture: ComponentFixture<PoolStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PoolStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PoolStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
