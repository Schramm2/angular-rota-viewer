import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { Observable } from 'rxjs';

import { RoleService } from './core/services/role.service';
import { DataService } from './core/services/data.service';
import { ThemeService } from './core/services/theme.service';
import { Role, Member } from './models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet, 
    RouterLink, 
    MatToolbarModule, 
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Rota Viewer';
  
  private roleService = inject(RoleService);
  private dataService = inject(DataService);
  private themeService = inject(ThemeService);

  currentRole$ = this.roleService.currentRole$;
  currentMemberId$ = this.roleService.currentMemberId$;
  members$ = this.dataService.members$;
  availableRoles = this.roleService.getAvailableRoles();
  currentTheme$ = this.themeService.currentTheme$;

  onRoleChange(role: Role): void {
    this.roleService.setRole(role);
  }

  onMemberChange(memberId: string): void {
    this.roleService.setCurrentMember(memberId);
  }

  getRoleDisplayName(role: Role): string {
    return this.roleService.getRoleDisplayName(role);
  }

  getMemberName(members: Member[], memberId: string | null): string {
    if (!memberId) return 'Select Member';
    const member = members.find(m => m.id === memberId);
    return member?.name || 'Unknown Member';
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  getThemeIcon(theme: string): string {
    return theme === 'dark' ? 'light_mode' : 'dark_mode';
  }

  getThemeTooltip(theme: string): string {
    return theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  }
}
