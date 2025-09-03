import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest, map, shareReplay } from 'rxjs';
import { DataPayload, Team, Member, Roster, Shift } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private data$: Observable<DataPayload>;

  constructor(private http: HttpClient) {
    this.data$ = this.http.get<DataPayload>('/data.json').pipe(
      shareReplay(1)
    );
  }

  // Expose streams for teams, members, and rosters
  get teams$(): Observable<Team[]> {
    return this.data$.pipe(
      map(data => data.teams)
    );
  }

  get members$(): Observable<Member[]> {
    return this.data$.pipe(
      map(data => data.members)
    );
  }

  get rosters$(): Observable<Roster[]> {
    return this.data$.pipe(
      map(data => data.rosters)
    );
  }

  // Get team by ID
  teamById$(teamId: string): Observable<Team | undefined> {
    return this.teams$.pipe(
      map(teams => teams.find(team => team.id === teamId))
    );
  }

  // Get roster by team ID
  rosterByTeamId$(teamId: string): Observable<Roster | undefined> {
    return this.rosters$.pipe(
      map(rosters => rosters.find(roster => roster.teamId === teamId))
    );
  }

  // Get shifts for a specific date
  shiftsForDate$(teamId: string, isoDate: string): Observable<Shift[]> {
    return this.rosterByTeamId$(teamId).pipe(
      map(roster => roster ? roster.shifts.filter(shift => shift.date === isoDate) : [])
    );
  }

  // Get shifts in a date range
  shiftsInRange$(teamId: string, startIso: string, endIso: string): Observable<Shift[]> {
    return this.rosterByTeamId$(teamId).pipe(
      map(roster => {
        if (!roster) return [];
        return roster.shifts.filter(shift => 
          shift.date >= startIso && shift.date <= endIso
        );
      })
    );
  }

  // Get shifts with member information joined
  shiftsWithMembers$(teamId: string, isoDate: string): Observable<Array<Shift & { member?: Member }>> {
    return combineLatest([
      this.shiftsForDate$(teamId, isoDate),
      this.members$
    ]).pipe(
      map(([shifts, members]) => {
        return shifts.map(shift => ({
          ...shift,
          member: members.find(member => member.id === shift.memberId)
        }));
      })
    );
  }

  // Get shifts with member information for a date range
  shiftsWithMembersInRange$(teamId: string, startIso: string, endIso: string): Observable<Array<Shift & { member?: Member }>> {
    return combineLatest([
      this.shiftsInRange$(teamId, startIso, endIso),
      this.members$
    ]).pipe(
      map(([shifts, members]) => {
        return shifts.map(shift => ({
          ...shift,
          member: members.find(member => member.id === shift.memberId)
        }));
      })
    );
  }

  // Get team members by team ID
  teamMembers$(teamId: string): Observable<Member[]> {
    return combineLatest([
      this.teamById$(teamId),
      this.members$
    ]).pipe(
      map(([team, members]) => {
        if (!team) return [];
        const memberIds = team.members.map(ref => ref.id);
        return members.filter(member => memberIds.includes(member.id));
      })
    );
  }
}
