import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivationPage } from './activation.page';

describe('ActivationPage', () => {
  let component: ActivationPage;
  let fixture: ComponentFixture<ActivationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
