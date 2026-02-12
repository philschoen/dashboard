import { Component, EventEmitter, Output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-jobs-toolbar',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule],
  templateUrl: './jobs-toolbar.html',
  styleUrl: './jobs-toolbar.css',
})
export class JobsToolbar {
  @Output() refresh = new EventEmitter<void>();
}