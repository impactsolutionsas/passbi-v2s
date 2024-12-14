import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RentalPage } from './rental.page';

describe('RentalPage', () => {
  let component: RentalPage;
  let fixture: ComponentFixture<RentalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RentalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
