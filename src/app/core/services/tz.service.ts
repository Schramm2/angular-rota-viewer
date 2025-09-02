import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DateTime } from 'luxon';

@Injectable({
  providedIn: 'root'
})
export class TzService {
  private timezoneSubject = new BehaviorSubject<string>('Africa/Johannesburg');

  constructor() {}

  // Expose timezone observable
  get timezone$(): Observable<string> {
    return this.timezoneSubject.asObservable();
  }

  // Get current timezone
  getTimezone(): string {
    return this.timezoneSubject.value;
  }

  // Set timezone
  setTimezone(zone: string): void {
    this.timezoneSubject.next(zone);
  }

  // Convert team time to viewer time
  toViewer(dateISO: string, timeHHmm: string, sourceZone: string): DateTime {
    const dateTimeString = `${dateISO}T${timeHHmm}`;
    const sourceDateTime = DateTime.fromISO(dateTimeString, { zone: sourceZone });
    return sourceDateTime.setZone(this.getTimezone());
  }

  // Format time
  formatTime(dt: DateTime, fmt: string = 'HH:mm'): string {
    return dt.toFormat(fmt);
  }

  // Format date
  formatDate(dt: DateTime, fmt: string = 'cccc, dd LLL yyyy'): string {
    return dt.toFormat(fmt);
  }
}
