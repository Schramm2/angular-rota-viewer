import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Role } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private roleSubject = new BehaviorSubject<Role>('member');
  private memberIdSubject = new BehaviorSubject<string | null>(null);

  constructor() {}

  // Expose current role observable
  get currentRole$(): Observable<Role> {
    return this.roleSubject.asObservable();
  }

  // Get current member ID observable
  get currentMemberId$(): Observable<string | null> {
    return this.memberIdSubject.asObservable();
  }

  // Set role
  setRole(role: Role): void {
    this.roleSubject.next(role);
  }

  // Set current member ID for "my shifts" filtering
  setCurrentMember(id: string | null): void {
    this.memberIdSubject.next(id);
  }

  // Get current role value
  getCurrentRole(): Role {
    return this.roleSubject.value;
  }

  // Get current member ID value
  getCurrentMemberId(): string | null {
    return this.memberIdSubject.value;
  }
}
