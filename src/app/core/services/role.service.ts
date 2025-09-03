import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Role } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private roleSubject = new BehaviorSubject<Role>('member');
  private memberIdSubject = new BehaviorSubject<string | null>(null);

  constructor() {
    // Load from localStorage if available
    const savedRole = localStorage.getItem('rota-app-role') as Role;
    const savedMemberId = localStorage.getItem('rota-app-member-id');
    
    if (savedRole && ['member', 'teamLead', 'manager', 'admin'].includes(savedRole)) {
      this.roleSubject.next(savedRole);
    }
    
    if (savedMemberId) {
      this.memberIdSubject.next(savedMemberId);
    }
  }

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
    localStorage.setItem('rota-app-role', role);
    
    // Clear member selection when switching away from member role
    if (role !== 'member') {
      this.setCurrentMember(null);
    }
  }

  // Set current member ID for "my shifts" filtering
  setCurrentMember(id: string | null): void {
    this.memberIdSubject.next(id);
    if (id) {
      localStorage.setItem('rota-app-member-id', id);
    } else {
      localStorage.removeItem('rota-app-member-id');
    }
  }

  // Get current role value
  getCurrentRole(): Role {
    return this.roleSubject.value;
  }

  // Get current member ID value
  getCurrentMemberId(): string | null {
    return this.memberIdSubject.value;
  }

  // Check if current role has permission for certain actions
  canViewFullTeam(): boolean {
    const role = this.getCurrentRole();
    return ['teamLead', 'manager', 'admin'].includes(role);
  }

  canViewReports(): boolean {
    return true; // All roles can view reports, but content differs
  }

  canViewAdminPanel(): boolean {
    return this.getCurrentRole() === 'admin';
  }

  // Get role display name
  getRoleDisplayName(role: Role): string {
    const roleNames: Record<Role, string> = {
      member: 'Team Member',
      teamLead: 'Team Lead',
      manager: 'Manager',
      admin: 'Administrator'
    };
    return roleNames[role];
  }

  // Get available roles for role switcher
  getAvailableRoles(): Role[] {
    return ['member', 'teamLead', 'manager', 'admin'];
  }
}
