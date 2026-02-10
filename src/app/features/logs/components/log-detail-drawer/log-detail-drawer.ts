import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';

import { LogEvent } from '../../models/log-event.model';

@Component({
  selector: 'app-log-detail-drawer',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatExpansionModule,
  ],
  templateUrl: './log-detail-drawer.html',
  styleUrl: './log-detail-drawer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogDetailDrawer {
  @Input() log: LogEvent | null = null;
  @Output() close = new EventEmitter<void>();

  levelClass(level: string | undefined): string {
    return level ? `lvl-${level.toLowerCase()}` : '';
  }
}
