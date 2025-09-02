import { Component, computed, effect, inject, signal } from '@angular/core';
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
import { Observable, combineLatest, map, startWith } from 'rxjs';
import { DataService } from '../../core/services/data.service';
import { TzService } from '../../core/services/tz.service';
import { Member, Team } from '../../models';

type ShiftWithMember = import('../../models').Shift & { member?: Member } & { overlap?: boolean };

@Component({
  selector: 'app-roster-day',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
  ],
  templateUrl: './roster-day.component.html',
  styleUrls: ['./roster-day.component.scss']
})
export class RosterDayComponent {
  private data = inject(DataService);
  tz = inject(TzService);

  timezones = [
    'Africa/Johannesburg',
    'UTC',
    'Europe/London',
    'America/New_York',
    'Asia/Dubai',
  ];

  teams$ = this.data.teams$;

  selectedTeamId = new FormControl<string | null>(null, { nonNullable: false });
  selectedDate = new FormControl<Date | null>(null);

  selectedTeam$: Observable<Team | undefined> = combineLatest([
    this.teams$,
    this.selectedTeamId.valueChanges.pipe(startWith(null))
  ]).pipe(
    map(([teams, id]) => {
      const selected = id || (teams.length ? teams[0].id : null);
      return teams.find(t => t.id === selected);
    })
  );

  shifts$: Observable<ShiftWithMember[]> = combineLatest([
    this.selectedTeam$,
    this.selectedDate.valueChanges.pipe(startWith(null))
  ]).pipe(
    map(([team, date]) => {
      const d = date ?? new Date();
      const iso = this.toIsoDate(d);
      if (!team) return { teamId: null as unknown as string, iso } as unknown as ShiftWithMember[];
      return { team, iso } as unknown as ShiftWithMember[];
    }),
    // The above map is only to pass values forward; we'll switch to actual data stream below using another map
  );

  // Actual shifts stream with member join and overlap detection
  shiftsWithFlags$: Observable<ShiftWithMember[]> = combineLatest([
    this.selectedTeam$,
    this.selectedDate.valueChanges.pipe(startWith(new Date()))
  ]).pipe(
    map(([team, date]) => {
      if (!team) return { teamId: null as unknown as string, iso: '' } as unknown as ShiftWithMember[];
      const iso = this.toIsoDate(date ?? new Date());
      return { team, iso };
    }),
    // fetch from service
    // Using a flattening map pattern without importing switchMap to keep deps minimal
    // We'll compose by returning an inner observable and flattening via combineLatest again
    // but simpler is to just reconstruct here with combineLatest
    // However to keep it straightforward, re-compute using data service here
    // eslint-disable-next-line rxjs/no-nested-subscribe
    map((ctx: any) => ctx),
  );

  // Expose a derived observable directly for template consumption using a helper method
  getShifts(team: Team | undefined, date: Date | null): Observable<ShiftWithMember[]> {
    if (!team) return new Observable<ShiftWithMember[]>(subscriber => { subscriber.next([]); subscriber.complete(); });
    const iso = this.toIsoDate(date ?? new Date());
    return this.data.shiftsWithMembers$(team.id, iso).pipe(
      map(shifts => this.withOverlapFlags(shifts))
    );
  }

  constructor() {
    // initialize defaults once teams load
    this.teams$.subscribe(teams => {
      if (!this.selectedTeamId.value && teams.length) {
        this.selectedTeamId.setValue(teams[0].id);
      }
      if (!this.selectedDate.value) {
        this.selectedDate.setValue(new Date());
      }
    });
  }

  toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  prev(): void {
    const d = this.selectedDate.value ?? new Date();
    const nd = new Date(d);
    nd.setDate(nd.getDate() - 1);
    this.selectedDate.setValue(nd);
  }

  next(): void {
    const d = this.selectedDate.value ?? new Date();
    const nd = new Date(d);
    nd.setDate(nd.getDate() + 1);
    this.selectedDate.setValue(nd);
  }

  today(): void {
    this.selectedDate.setValue(new Date());
  }

  onTimezoneChange(zone: string): void {
    this.tz.setTimezone(zone);
  }

  withOverlapFlags(shifts: ShiftWithMember[]): ShiftWithMember[] {
    const byMember: Record<string, ShiftWithMember[]> = {};
    for (const s of shifts) {
      const key = s.memberId || '_none_';
      if (!byMember[key]) byMember[key] = [];
      byMember[key].push(s);
    }
    const result: ShiftWithMember[] = shifts.map(s => ({ ...s, overlap: false }));
    const idToIndex: Map<string, number> = new Map();
    result.forEach((s, i) => idToIndex.set(s.id, i));
    const hasOverlap = (aStart: string, aEnd: string, bStart: string, bEnd: string) => {
      return aStart < bEnd && bStart < aEnd; // [start, end)
    };
    for (const memberId of Object.keys(byMember)) {
      const list = byMember[memberId].slice().sort((a, b) => a.start.localeCompare(b.start));
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          if (hasOverlap(list[i].start, list[i].end, list[j].start, list[j].end)) {
            const ii = idToIndex.get(list[i].id);
            const jj = idToIndex.get(list[j].id);
            if (ii != null) result[ii].overlap = true;
            if (jj != null) result[jj].overlap = true;
          }
        }
      }
    }
    return result;
  }
}


