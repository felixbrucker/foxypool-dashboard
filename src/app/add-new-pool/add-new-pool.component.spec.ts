import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewPoolComponent } from './add-new-pool.component';

describe('AddNewPoolComponent', () => {
  let component: AddNewPoolComponent;
  let fixture: ComponentFixture<AddNewPoolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddNewPoolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewPoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
