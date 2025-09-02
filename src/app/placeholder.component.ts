import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from './core/services/data.service';
import { Shift, Member } from './models';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="placeholder-content">
      <h2>Welcome to Rota Viewer — Phase 3 Core Services</h2>
      <div class="shifts-section">
        <h3>Shifts for Team t1 on 2025-09-02</h3>
        <div *ngIf="shifts$ | async as shifts" class="shifts-list">
          <div *ngFor="let shiftWithMember of shifts" class="shift-item">
            <div class="shift-info">
              <strong>{{ shiftWithMember.task }}</strong>
              <span class="time">{{ shiftWithMember.start }} - {{ shiftWithMember.end }}</span>
            </div>
            <div class="member-info" *ngIf="shiftWithMember.member">
              <span class="member-name">{{ shiftWithMember.member.name }}</span>
              <span class="member-role">({{ shiftWithMember.member.role }})</span>
            </div>
          </div>
        </div>
        <div *ngIf="(shifts$ | async)?.length === 0" class="no-shifts">
          No shifts found for this date.
        </div>
      </div>
    </div>
  `,
  styles: [`
    .placeholder-content {
      text-align: center;
      padding: 2rem;
    }
    
    h2 {
      color: #666;
      font-weight: 300;
      margin-bottom: 2rem;
    }

    .shifts-section {
      max-width: 600px;
      margin: 0 auto;
      text-align: left;
    }

    h3 {
      color: #333;
      margin-bottom: 1rem;
    }

    .shifts-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .shift-item {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 1rem;
      background: #f9f9f9;
    }

    .shift-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .time {
      color: #666;
      font-size: 0.9em;
    }

    .member-info {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .member-name {
      font-weight: 500;
    }

    .member-role {
      color: #666;
      font-size: 0.9em;
    }

    .no-shifts {
      color: #666;
      font-style: italic;
      text-align: center;
      padding: 2rem;
    }
  `]
})
export class PlaceholderComponent {
  private dataService = inject(DataService);
  
  shifts$ = this.dataService.shiftsWithMembers$('t1', '2025-09-02');
}
