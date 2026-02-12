import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsToolbar } from './jobs-toolbar';

describe('JobsToolbar', () => {
  let component: JobsToolbar;
  let fixture: ComponentFixture<JobsToolbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobsToolbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobsToolbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
