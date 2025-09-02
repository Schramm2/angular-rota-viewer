// src/app/models.ts

export type Role = 'manager' | 'teamLead' | 'member' | 'admin';

export interface Team {
  id: string;
  name: string;
  timezone: string;      // IANA, e.g. "Africa/Johannesburg"
  members: MemberRef[];  // lightweight refs to Member ids
}

export interface MemberRef { id: string; }

export interface Member {
  id: string;
  name: string;
  role: Role;
  skills?: string[];
  timezone?: string;     // optional override of team timezone
  isActive: boolean;
}

export interface Shift {
  id: string;
  date: string;          // ISO date, e.g. "2025-09-02"
  start: string;         // "HH:mm" 24h
  end: string;           // "HH:mm"
  task: string;          // e.g. "Support Desk"
  memberId: string;      // FK → Member.id
  teamId: string;        // FK → Team.id (source TZ)
}

export interface Roster {
  id: string;
  teamId: string;        // FK → Team.id
  days: string[];        // convenience list of included days
  shifts: Shift[];       // all shifts for those days
}

/** Root payload shape of assets/data.json */
export interface DataPayload {
  teams: Team[];
  members: Member[];
  rosters: Roster[];
}
