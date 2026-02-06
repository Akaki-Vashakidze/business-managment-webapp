import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ItemManagement, User } from '../../../interfaces/shared-interfaces';
import { UserService } from '../../auth/services/user.service';
import { ItemManagementService } from '../../auth/services/itemManagement.service';
import { SnackbarService } from '../../auth/services/snack-bar.service';
import { BusinessService } from '../../auth/services/business.service';

interface TimeSlot {
  start: number;
  end: number;
  label: string;
  reserved: boolean;
  selected: boolean;
}

interface DayInfo {
  weekday: string;
  dayNum: string;
  month: string;
  dateStr: string;
}

@Component({
  selector: 'app-item-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './item-management.component.html',
  styleUrl: './item-management.component.scss'
})
export class ItemManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  itemId!: string;
  users: User[] = [];
  weekDays: DayInfo[] = []; // Holds the 7-day strip data

  reservation = {
    user: '', 
    date: '',
    startHour: 0,
    startMinute: 0,
    endHour: 0,
    endMinute: 0,
    isPaid: false
  };

  allReservations: ItemManagement[] = [];
  dayReservations: ItemManagement[] = [];
  timeSlots: TimeSlot[] = [];

  selectedStart: TimeSlot | null = null;
  selectedEnd: TimeSlot | null = null;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private itemManagementService: ItemManagementService,
    private snackbar: SnackbarService,
    private businessService: BusinessService
  ) {}

  ngOnInit(): void {
    this.itemId = this.route.snapshot.paramMap.get('id')!;
    
    // 1. Initialize the 7-day calendar strip
    this.generateWeek();
    
    // 2. Set default date to Today (first item in our weekDays array)
    this.setDateByString(this.weekDays[0].dateStr);

    // 3. Load business context and data
    this.businessService.businessSelected
      .pipe(takeUntil(this.destroy$))
      .subscribe(biz => {
        if (biz) {
          this.getAllUsers(biz._id);
          this.loadReservations();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Generates an array of the next 7 days for the horizontal scroller
   */
  generateWeek() {
    const days: DayInfo[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push({
        weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate().toString(),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        dateStr: d.toISOString().split('T')[0]
      });
    }
    this.weekDays = days;
  }

  /**
   * Sets the current reservation date and refreshes slots
   */
  setDateByString(dateStr: string) {
    this.reservation.date = dateStr;
    this.onDateChange();
  }

  /**
   * Handles changes from the hidden native HTML5 date picker
   */
  onManualDateChange() {
    this.onDateChange();
  }

  onDateChange() {
    this.clearSelection();
    this.filterDayReservations();
    this.buildSlots();
  }

  getAllUsers(businessId: string) {
    this.userService.getAllUsers(businessId).subscribe({
      next: (u) => this.users = u,
      error: () => this.snackbar.error('Could not load users')
    });
  }

  loadReservations() {
    this.itemManagementService
      .getAllReservationsForItem(this.itemId)
      .subscribe(res => {
        this.allReservations = res;
        this.onDateChange();
      });
  }

  filterDayReservations() {
    if (!this.reservation.date) return;
    // We use toDateString to compare just the date parts without time interference
    const selectedDateStr = new Date(this.reservation.date).toDateString();

    this.dayReservations = this.allReservations.filter(r => 
      new Date(r.date).toDateString() === selectedDateStr
    );
  }

  buildSlots() {
    this.timeSlots = [];
    // Generating 15-minute intervals from 12:00 (720 mins) to 00:00 (1440 mins)
    for (let m = 12 * 60; m < 24 * 60; m += 15) {
      const end = m + 15;
      const reserved = this.dayReservations.some(r => {
        const rs = r.startHour * 60 + r.startMinute;
        const re = r.endHour * 60 + r.endMinute;
        // Check for any overlap
        return m < re && end > rs;
      });

      this.timeSlots.push({
        start: m,
        end,
        reserved,
        selected: false,
        label: this.format(m)
      });
    }
  }

  selectSlot(slot: TimeSlot) {
    if (slot.reserved) return;

    // Reset or start first point of selection
    if (!this.selectedStart || this.selectedEnd) {
      this.clearSelection();
      this.selectedStart = slot;
      slot.selected = true;
      return;
    }

    // Logic for setting the end point
    if (slot.start <= this.selectedStart.start) {
      this.clearSelection();
      this.selectedStart = slot;
      slot.selected = true;
      return;
    }

    // Collision check for the range
    const hasCollision = this.timeSlots.some(s =>
      s.reserved && s.start >= this.selectedStart!.start && s.end <= slot.end
    );

    if (hasCollision) {
      this.snackbar.error('Overlap detected with another booking');
      return;
    }

    this.selectedEnd = slot;
    this.highlightRange();
    this.applyReservationTime();
  }

  highlightRange() {
    if (!this.selectedStart || !this.selectedEnd) return;
    this.timeSlots.forEach(s => {
      s.selected = s.start >= this.selectedStart!.start && s.end <= this.selectedEnd!.end;
    });
  }

  applyReservationTime() {
    if (!this.selectedStart || !this.selectedEnd) return;
    this.reservation.startHour = Math.floor(this.selectedStart.start / 60);
    this.reservation.startMinute = this.selectedStart.start % 60;
    this.reservation.endHour = Math.floor(this.selectedEnd.end / 60);
    this.reservation.endMinute = this.selectedEnd.end % 60;
  }

  clearSelection() {
    this.timeSlots.forEach(s => s.selected = false);
    this.selectedStart = null;
    this.selectedEnd = null;
  }

  reserveItem() {
    if (!this.selectedStart || !this.selectedEnd) {
      this.snackbar.error('Select a time range first');
      return;
    }

    const payload = {
      item: this.itemId,
      user: this.reservation.user || null,
      date: this.reservation.date,
      startHour: this.reservation.startHour,
      startMinute: this.reservation.startMinute,
      endHour: this.reservation.endHour,
      endMinute: this.reservation.endMinute,
      isPaid: this.reservation.isPaid ? 1 : 0
    };

    this.itemManagementService.reserveitem(payload).subscribe({
      next: () => {
        this.snackbar.success('Successfully reserved');
        this.loadReservations();
        this.clearSelection();
      },
      error: (err) => this.snackbar.error(err.error?.message || 'Reservation failed')
    });
  }

  format(min: number) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  get isSelectionComplete(): boolean {
    return !!(this.selectedStart && this.selectedEnd);
  }
}