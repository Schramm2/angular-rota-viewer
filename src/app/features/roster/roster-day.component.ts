import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Observable, combineLatest, map, startWith, switchMap } from 'rxjs';

import { DataService } from '../../core/services/data.service';
import { TzService } from '../../core/services/tz.service';
import { RoleService } from '../../core/services/role.service';
import { Team, Shift, Member, Role } from '../../models';

interface ShiftWithMember extends Shift {
  member?: Member;
  hasOverlap?: boolean;
  isUnassigned?: boolean;
  startTime?: string;
  endTime?: string;
  sourceTimezone?: string;
}

@Component({
  selector: 'app-roster-day',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './roster-day.component.html',
  styleUrls: ['./roster-day.component.scss']
})
export class RosterDayComponent implements OnInit {
  private dataService = inject(DataService);
  private tzService = inject(TzService);
  private roleService = inject(RoleService);

  // Form controls
  selectedTeamId = new FormControl<string>('');
  selectedDate = new FormControl<Date>(new Date());

  // Available timezones
  timezones = [
    'Africa/Johannesburg',
    'UTC',
    'Europe/London',
    'America/New_York',
    'Asia/Dubai'
  ];

  // Observables
  teams$ = this.dataService.teams$;
  selectedTeam$: Observable<Team | undefined>;
  shifts$: Observable<ShiftWithMember[]>;
  currentTimezone$ = this.tzService.timezone$;
  currentRole$ = this.roleService.currentRole$;
  currentMemberId$ = this.roleService.currentMemberId$;
  members$ = this.dataService.members$;
  
  // Role-based computed observables
  filteredShifts$: Observable<ShiftWithMember[]>;
  nextShift$: Observable<ShiftWithMember | null>;
  adminSummary$: Observable<{
    totalTeams: number;
    totalMembers: number;
    totalShifts: number;
    unassignedShifts: number;
    overlapShifts: number;
  } | null>;

  constructor() {
    // Initialize selected team observable
    this.selectedTeam$ = combineLatest([
      this.teams$,
      this.selectedTeamId.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([teams, teamId]) => teams.find(team => team.id === teamId))
    );

    // Initialize shifts observable - simplified approach
    this.shifts$ = new Observable<ShiftWithMember[]>(subscriber => subscriber.next([]));
    
    // Initialize filtered shifts based on role
    this.filteredShifts$ = new Observable<ShiftWithMember[]>(subscriber => subscriber.next([]));
    
    // Initialize next shift for member role
    this.nextShift$ = new Observable<ShiftWithMember | null>(subscriber => subscriber.next(null));
    
    // Initialize admin summary
    this.adminSummary$ = new Observable<{
      totalTeams: number;
      totalMembers: number;
      totalShifts: number;
      unassignedShifts: number;
      overlapShifts: number;
    } | null>(subscriber => subscriber.next(null));
  }

  ngOnInit(): void {
    // Set default team to first available team
    this.teams$.subscribe(teams => {
      if (teams.length > 0 && !this.selectedTeamId.value) {
        this.selectedTeamId.setValue(teams[0].id);
      }
    });

    // Set default date to today
    const today = new Date();
    this.selectedDate.setValue(today);

    // Setup shifts observable with proper flattening
    this.shifts$ = combineLatest([
      this.selectedTeamId.valueChanges.pipe(startWith('')),
      this.selectedDate.valueChanges.pipe(startWith(new Date())),
      this.selectedTeam$
    ]).pipe(
      switchMap(([teamId, date, team]) => {
        if (!teamId || !date) {
          return new Observable<ShiftWithMember[]>(subscriber => subscriber.next([]));
        }
        
        const isoDate = this.toIsoDate(date);
        return this.dataService.shiftsWithMembers$(teamId, isoDate).pipe(
          map(shifts => this.processShifts(shifts, team))
        );
      })
    );

    // Setup role-based filtered shifts
    this.filteredShifts$ = combineLatest([
      this.shifts$,
      this.currentRole$,
      this.currentMemberId$
    ]).pipe(
      map(([shifts, role, memberId]) => this.filterShiftsByRole(shifts, role, memberId))
    );

    // Setup next shift for member role
    this.nextShift$ = combineLatest([
      this.dataService.rosters$,
      this.currentMemberId$,
      this.currentRole$
    ]).pipe(
      map(([rosters, memberId, role]) => {
        if (role !== 'member' || !memberId) return null;
        return this.findNextShift(rosters, memberId);
      })
    );

    // Setup admin summary
    this.adminSummary$ = combineLatest([
      this.currentRole$,
      this.shifts$,
      this.teams$,
      this.members$
    ]).pipe(
      map(([role, shifts, teams, members]) => {
        if (role !== 'admin') return null;
        return this.calculateAdminSummary(shifts, teams, members);
      })
    );
  }

  private processShifts(shifts: (Shift & { member?: Member })[], team?: Team): ShiftWithMember[] {
    const processedShifts: ShiftWithMember[] = shifts.map(shift => {
      const isUnassigned = !shift.member;
      
      // Convert times to viewer timezone
      let startTime = shift.start;
      let endTime = shift.end;
      let sourceTimezone = team?.timezone || 'UTC';
      
      try {
        const startDateTime = this.tzService.toViewer(shift.date, shift.start, sourceTimezone);
        const endDateTime = this.tzService.toViewer(shift.date, shift.end, sourceTimezone);
        startTime = this.tzService.formatTime(startDateTime);
        endTime = this.tzService.formatTime(endDateTime);
      } catch (error) {
        console.warn('Time conversion failed:', error);
      }

      return {
        ...shift,
        isUnassigned,
        startTime,
        endTime,
        sourceTimezone,
        hasOverlap: false // Will be set below
      };
    });

    // Check for overlaps
    this.detectOverlaps(processedShifts);

    return processedShifts;
  }

  private detectOverlaps(shifts: ShiftWithMember[]): void {
    for (let i = 0; i < shifts.length; i++) {
      for (let j = i + 1; j < shifts.length; j++) {
        const shift1 = shifts[i];
        const shift2 = shifts[j];
        
        // Check if same member and overlapping times
        if (shift1.memberId === shift2.memberId && 
            shift1.member && shift2.member) {
          
          const start1 = this.timeToMinutes(shift1.start);
          const end1 = this.timeToMinutes(shift1.end);
          const start2 = this.timeToMinutes(shift2.start);
          const end2 = this.timeToMinutes(shift2.end);
          
          // Check for overlap: [start1, end1) intersects [start2, end2)
          if (start1 < end2 && start2 < end1) {
            shift1.hasOverlap = true;
            shift2.hasOverlap = true;
          }
        }
      }
    }
  }

  private timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Utility method to convert Date to ISO date string
  toIsoDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Navigation helpers
  prev(): void {
    const currentDate = this.selectedDate.value;
    if (currentDate) {
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);
      this.selectedDate.setValue(prevDate);
    }
  }

  next(): void {
    const currentDate = this.selectedDate.value;
    if (currentDate) {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);
      this.selectedDate.setValue(nextDate);
    }
  }

  today(): void {
    this.selectedDate.setValue(new Date());
  }

  // Timezone change handler
  onTimezoneChange(timezone: string): void {
    this.tzService.setTimezone(timezone);
  }

  // Role-based filtering
  private filterShiftsByRole(shifts: ShiftWithMember[], role: Role, memberId: string | null): ShiftWithMember[] {
    if (role === 'member' && memberId) {
      // Member role: show only their shifts
      return shifts.filter(shift => shift.memberId === memberId);
    }
    // TeamLead, Manager, Admin: show all shifts
    return shifts;
  }

  // Find next upcoming shift for a member
  private findNextShift(rosters: any[], memberId: string): ShiftWithMember | null {
    const now = new Date();
    const today = this.toIsoDate(now);
    const currentTime = now.getHours() * 60 + now.getMinutes();

    let nextShift: ShiftWithMember | null = null;
    let earliestDateTime = Number.MAX_SAFE_INTEGER;

    for (const roster of rosters) {
      for (const shift of roster.shifts) {
        if (shift.memberId === memberId) {
          const shiftDate = shift.date;
          const [shiftHour, shiftMin] = shift.start.split(':').map(Number);
          const shiftTime = shiftHour * 60 + shiftMin;

          // Calculate datetime in minutes since epoch for comparison
          const shiftDateTime = new Date(shiftDate + 'T' + shift.start).getTime();

          // Only consider future shifts
          if (shiftDate > today || (shiftDate === today && shiftTime > currentTime)) {
            if (shiftDateTime < earliestDateTime) {
              earliestDateTime = shiftDateTime;
              nextShift = {
                ...shift,
                startTime: shift.start,
                endTime: shift.end,
                sourceTimezone: 'UTC'
              };
            }
          }
        }
      }
    }

    return nextShift;
  }

  // Calculate admin summary statistics
  private calculateAdminSummary(shifts: ShiftWithMember[], teams: Team[], members: Member[]): {
    totalTeams: number;
    totalMembers: number;
    totalShifts: number;
    unassignedShifts: number;
    overlapShifts: number;
  } {
    return {
      totalTeams: teams.length,
      totalMembers: members.filter(m => m.isActive).length,
      totalShifts: shifts.length,
      unassignedShifts: shifts.filter(s => s.isUnassigned).length,
      overlapShifts: shifts.filter(s => s.hasOverlap).length
    };
  }

  // Helper methods for role-based display
  canViewFullTeam(): boolean {
    return this.roleService.canViewFullTeam();
  }

  isAdminRole(): boolean {
    return this.roleService.getCurrentRole() === 'admin';
  }

  isMemberRole(): boolean {
    return this.roleService.getCurrentRole() === 'member';
  }

  formatNextShiftDate(shift: ShiftWithMember): string {
    const date = new Date(shift.date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (shift.date === this.toIsoDate(today)) {
      return 'Today';
    } else if (shift.date === this.toIsoDate(tomorrow)) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  }
}
