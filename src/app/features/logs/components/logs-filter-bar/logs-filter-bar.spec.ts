import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogsFilterBar } from './logs-filter-bar';

describe('LogsFilterBar', () => {
  let component: LogsFilterBar;
  let fixture: ComponentFixture<LogsFilterBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogsFilterBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogsFilterBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
