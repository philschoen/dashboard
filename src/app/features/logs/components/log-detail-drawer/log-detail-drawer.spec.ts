import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogDetailDrawer } from './log-detail-drawer';

describe('LogDetailDrawer', () => {
  let component: LogDetailDrawer;
  let fixture: ComponentFixture<LogDetailDrawer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogDetailDrawer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogDetailDrawer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
