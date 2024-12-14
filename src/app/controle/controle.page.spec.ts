import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlePage } from './controle.page';

describe('ControlePage', () => {
  let component: ControlePage;
  let fixture: ComponentFixture<ControlePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
