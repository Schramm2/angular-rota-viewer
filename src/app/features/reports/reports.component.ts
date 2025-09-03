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
import { BaseChartDirective } from 'ng2-charts';
import { Observable, combineLatest, map, startWith, switchMap } from 'rxjs';
import { 
  ChartConfiguration, 
  ChartData, 
  ChartType,
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController
} from 'chart.js';

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController
);

import { DataService } from '../../core/services/data.service';
import { Team, Shift, Member } from '../../models';

interface ReportData {
  totalShifts: number;
  membersScheduled: number;
  coveragePercentage: number;
  fairnessScore: number;
  shiftsPerMember: { memberName: string; shifts: number }[];
  dailyCoverage: { date: string; coverage: number }[];
}

@Component({
  selector: 'app-reports',
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
    BaseChartDirective
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  private dataService = inject(DataService);

  // Form controls
  selectedTeamId = new FormControl<string>('');
  startDate = new FormControl<Date>(new Date());
  endDate = new FormControl<Date>(new Date());

  // Observables
  teams$ = this.dataService.teams$;
  reportData$: Observable<ReportData>;

  // Chart configurations
  barChartType = 'bar' as const;
  lineChartType = 'line' as const;
  
  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Shifts per Member',
      backgroundColor: '#3f51b5',
      borderColor: '#3f51b5',
      borderWidth: 1
    }]
  };

  lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Daily Coverage %',
      backgroundColor: 'rgba(63, 81, 181, 0.2)',
      borderColor: '#3f51b5',
      borderWidth: 2,
      fill: true,
      tension: 0.1
    }]
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Shifts'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Team Members'
        }
      }
    }
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Coverage Percentage'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  };

  constructor() {
    // Initialize report data observable
    this.reportData$ = new Observable<ReportData>(subscriber => 
      subscriber.next({
        totalShifts: 0,
        membersScheduled: 0,
        coveragePercentage: 0,
        fairnessScore: 0,
        shiftsPerMember: [],
        dailyCoverage: []
      })
    );
  }

  ngOnInit(): void {
    // Set default team to first available team
    this.teams$.subscribe(teams => {
      if (teams.length > 0 && !this.selectedTeamId.value) {
        this.selectedTeamId.setValue(teams[0].id);
      }
    });

    // Set default date range (last 7 days)
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);
    
    this.startDate.setValue(weekAgo);
    this.endDate.setValue(today);

    // Setup report data observable
    this.reportData$ = combineLatest([
      this.selectedTeamId.valueChanges.pipe(startWith('')),
      this.startDate.valueChanges.pipe(startWith(weekAgo)),
      this.endDate.valueChanges.pipe(startWith(today))
    ]).pipe(
      switchMap(([teamId, startDate, endDate]) => {
        if (!teamId || !startDate || !endDate) {
          return new Observable<ReportData>(subscriber => 
            subscriber.next({
              totalShifts: 0,
              membersScheduled: 0,
              coveragePercentage: 0,
              fairnessScore: 0,
              shiftsPerMember: [],
              dailyCoverage: []
            })
          );
        }
        
        const startIso = this.toIsoDate(startDate);
        const endIso = this.toIsoDate(endDate);
        
        return this.calculateReportData(teamId, startIso, endIso);
      })
    );

    // Subscribe to report data to update charts
    this.reportData$.subscribe(data => {
      this.updateCharts(data);
    });
  }

  private calculateReportData(teamId: string, startIso: string, endIso: string): Observable<ReportData> {
    return combineLatest([
      this.dataService.shiftsWithMembersInRange$(teamId, startIso, endIso),
      this.dataService.teamMembers$(teamId)
    ]).pipe(
      map(([shifts, teamMembers]) => {
        // Calculate KPIs
        const totalShifts = shifts.length;
        const uniqueMembers = new Set(shifts.map(shift => shift.memberId));
        const membersScheduled = uniqueMembers.size;
        
        // Calculate coverage percentage (assuming 24/7 coverage needed)
        const dateRange = this.getDateRange(startIso, endIso);
        const totalPossibleHours = dateRange.length * 24;
        const actualCoveredHours = shifts.reduce((total, shift) => {
          const duration = this.getShiftDurationHours(shift.start, shift.end);
          return total + duration;
        }, 0);
        const coveragePercentage = totalPossibleHours > 0 ? 
          Math.round((actualCoveredHours / totalPossibleHours) * 100) : 0;

        // Calculate fairness (standard deviation of shifts per member)
        const shiftsPerMemberData = this.calculateShiftsPerMember(shifts, teamMembers);
        const fairnessScore = this.calculateFairness(shiftsPerMemberData);

        // Calculate daily coverage
        const dailyCoverage = this.calculateDailyCoverage(shifts, dateRange);

        return {
          totalShifts,
          membersScheduled,
          coveragePercentage,
          fairnessScore,
          shiftsPerMember: shiftsPerMemberData,
          dailyCoverage
        };
      })
    );
  }

  private calculateShiftsPerMember(shifts: (Shift & { member?: Member })[], teamMembers: Member[]): { memberName: string; shifts: number }[] {
    const shiftCounts = new Map<string, number>();
    
    // Initialize all team members with 0 shifts
    teamMembers.forEach(member => {
      shiftCounts.set(member.id, 0);
    });

    // Count shifts per member
    shifts.forEach(shift => {
      const currentCount = shiftCounts.get(shift.memberId) || 0;
      shiftCounts.set(shift.memberId, currentCount + 1);
    });

    // Convert to array with member names
    return Array.from(shiftCounts.entries()).map(([memberId, count]) => {
      const member = teamMembers.find(m => m.id === memberId);
      return {
        memberName: member?.name || 'Unknown',
        shifts: count
      };
    }).sort((a, b) => b.shifts - a.shifts);
  }

  private calculateFairness(shiftsPerMember: { memberName: string; shifts: number }[]): number {
    if (shiftsPerMember.length === 0) return 0;

    const shiftCounts = shiftsPerMember.map(item => item.shifts);
    const mean = shiftCounts.reduce((sum, count) => sum + count, 0) / shiftCounts.length;
    const variance = shiftCounts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / shiftCounts.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Return as a "fairness score" - lower standard deviation = higher fairness
    // Convert to 0-100 scale where 100 is perfectly fair (std dev = 0)
    return Math.max(0, Math.round(100 - (standardDeviation * 10)));
  }

  private calculateDailyCoverage(shifts: Shift[], dateRange: string[]): { date: string; coverage: number }[] {
    return dateRange.map(date => {
      const dayShifts = shifts.filter(shift => shift.date === date);
      const totalHours = dayShifts.reduce((total, shift) => {
        return total + this.getShiftDurationHours(shift.start, shift.end);
      }, 0);
      
      // Calculate coverage as percentage of 24 hours
      const coverage = Math.min(100, Math.round((totalHours / 24) * 100));
      
      return {
        date: this.formatDateForDisplay(date),
        coverage
      };
    });
  }

  private getDateRange(startIso: string, endIso: string): string[] {
    const dates: string[] = [];
    const start = new Date(startIso);
    const end = new Date(endIso);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      dates.push(this.toIsoDate(date));
    }
    
    return dates;
  }

  private getShiftDurationHours(start: string, end: string): number {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    let endMinutes = endHour * 60 + endMin;
    
    // Handle overnight shifts
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }
    
    return (endMinutes - startMinutes) / 60;
  }

  private formatDateForDisplay(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  private updateCharts(data: ReportData): void {
    // Update bar chart
    this.barChartData = {
      labels: data.shiftsPerMember.map(item => item.memberName),
      datasets: [{
        data: data.shiftsPerMember.map(item => item.shifts),
        label: 'Shifts per Member',
        backgroundColor: '#3f51b5',
        borderColor: '#3f51b5',
        borderWidth: 1
      }]
    };

    // Update line chart
    this.lineChartData = {
      labels: data.dailyCoverage.map(item => item.date),
      datasets: [{
        data: data.dailyCoverage.map(item => item.coverage),
        label: 'Daily Coverage %',
        backgroundColor: 'rgba(63, 81, 181, 0.2)',
        borderColor: '#3f51b5',
        borderWidth: 2,
        fill: true,
        tension: 0.1
      }]
    };
  }

  // Utility method to convert Date to ISO date string
  toIsoDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Date range validation
  onStartDateChange(): void {
    const startDate = this.startDate.value;
    const endDate = this.endDate.value;
    
    if (startDate && endDate && startDate > endDate) {
      this.endDate.setValue(startDate);
    }
  }

  onEndDateChange(): void {
    const startDate = this.startDate.value;
    const endDate = this.endDate.value;
    
    if (startDate && endDate && endDate < startDate) {
      this.startDate.setValue(endDate);
    }
  }
}
