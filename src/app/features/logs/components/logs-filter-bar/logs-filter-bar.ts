import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { LogsFilter, LogLevel, TimePreset } from '../../models/log-filter.model';

type FilterFormValue = {
  preset: TimePreset;
  range: { start: Date | null; end: Date | null };
  levels: LogLevel[];
  service: string | null;
  installationId: string | null;
  query: string;
};

@Component({
  selector: 'app-logs-filter-bar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './logs-filter-bar.html',
  styleUrl: './logs-filter-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogsFilterBar {
  @Input() services: string[] = [];
  @Input() installationIds: string[] = [];
  @Input() disabled = false;

  @Output() filterChange = new EventEmitter<LogsFilter>();
  @Output() refresh = new EventEmitter<void>();

  readonly levels: LogLevel[] = ['Trace', 'Debug', 'Info', 'Warn', 'Error', 'Critical'];
  readonly presets: { value: TimePreset; label: string }[] = [
    { value: '15m', label: 'Letzte 15 Min' },
    { value: '1h', label: 'Letzte 1 Std' },
    { value: '24h', label: 'Letzte 24 Std' },
    { value: 'custom', label: 'Benutzerdefiniert' },
  ];

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    preset: this.fb.nonNullable.control<TimePreset>('15m'),
    range: this.fb.group({
      start: this.fb.control<Date | null>(null),
      end: this.fb.control<Date | null>(null),
    }),
    levels: this.fb.nonNullable.control<LogLevel[]>(['Error', 'Critical']),
    service: this.fb.control<string | null>(null),
    installationId: this.fb.control<string | null>(null),
    query: this.fb.nonNullable.control<string>(''),
  });

  readonly isCustom$ = this.form.controls.preset.valueChanges.pipe(
    startWith(this.form.controls.preset.value),
    map((p) => p === 'custom')
  );

  constructor() {
    // Emit Filter-Updates: Suche gedrosselt, Rest sofort
    this.form.valueChanges
      .pipe(
        debounceTime(300),
        map((v) => this.toFilter(v as FilterFormValue)),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      )
      .subscribe((filter) => this.filterChange.emit(filter));
  }

  onReset(): void {
    this.form.reset({
      preset: '15m',
      range: { start: null, end: null },
      levels: ['Error', 'Critical'],
      service: null,
      installationId: null,
      query: '',
    });
  }

  private toFilter(v: FilterFormValue): LogsFilter {
    const now = new Date();
    const to = now;

    if (v.preset !== 'custom') {
      const minutes =
        v.preset === '15m' ? 15 : v.preset === '1h' ? 60 : 24 * 60;
      const from = new Date(now.getTime() - minutes * 60_000);
      return {
        preset: v.preset,
        fromUtc: from.toISOString(),
        toUtc: to.toISOString(),
        levels: v.levels,
        service: v.service ?? undefined,
        installationId: v.installationId ?? undefined,
        query: v.query?.trim() || undefined,
      };
    }

    // custom
    const start = v.range?.start ?? null;
    const end = v.range?.end ?? null;

    return {
      preset: 'custom',
      fromUtc: start ? start.toISOString() : undefined,
      toUtc: end ? end.toISOString() : undefined,
      levels: v.levels,
      service: v.service ?? undefined,
      installationId: v.installationId ?? undefined,
      query: v.query?.trim() || undefined,
    };
  }
}
