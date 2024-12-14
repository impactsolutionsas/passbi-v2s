import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RepportPage } from './repport.page';

describe('RepportPage', () => {
  let component: RepportPage;
  let fixture: ComponentFixture<RepportPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RepportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
