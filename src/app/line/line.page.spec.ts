import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LinePage } from './line.page';

describe('LinePage', () => {
  let component: LinePage;
  let fixture: ComponentFixture<LinePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LinePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
