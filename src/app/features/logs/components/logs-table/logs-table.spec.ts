import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogsTable } from './logs-table';

describe('LogsTable', () => {
  let component: LogsTable;
  let fixture: ComponentFixture<LogsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogsTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogsTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
