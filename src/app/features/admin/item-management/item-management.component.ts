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
  quickDate: 'today' | 'tomorrow' | 'dayAfter' | null = 'today';

  reservation = {
    user: '', // Empty string for "Unregistered"
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
    this.setDateByOffset(0);

    // Context-aware initialization
    this.businessService.businessSelected
      .pipe(takeUntil(this.destroy$))
      .subscribe(biz => {
        if (biz) {
          this.getAllUsers(biz._id);
          this.loadReservations(); // Load data once business is confirmed
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getAllUsers(businessId: string) {
    this.userService.getAllUsers(businessId).subscribe({
      next: (u) => this.users = u,
      error: () => this.snackbar.error('Could not load users')
    });
  }

  setQuickDate(type: 'today' | 'tomorrow' | 'dayAfter') {
    this.quickDate = type;
    const offset = type === 'today' ? 0 : type === 'tomorrow' ? 1 : 2;
    this.setDateByOffset(offset);
  }

  setDateByOffset(days: number) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    this.reservation.date = d.toISOString().split('T')[0];
    this.onDateChange();
  }

  onManualDateChange() {
    this.quickDate = null;
    this.onDateChange();
  }

  onDateChange() {
    this.clearSelection();
    this.filterDayReservations();
    this.buildSlots();
  }

  filterDayReservations() {
    if (!this.reservation.date) return;
    const selectedDateStr = new Date(this.reservation.date).toDateString();

    this.dayReservations = this.allReservations.filter(r => 
      new Date(r.date).toDateString() === selectedDateStr
    );
  }

  buildSlots() {
    this.timeSlots = [];
    // ⏱ 15-minute intervals (12:00 PM to 12:00 AM)
    for (let m = 12 * 60; m < 24 * 60; m += 15) {
      const end = m + 15;
      const reserved = this.dayReservations.some(r => {
        const rs = r.startHour * 60 + r.startMinute;
        const re = r.endHour * 60 + r.endMinute;
        return m < re && end > rs;
      });

      this.timeSlots.push({
        start: m,
        end,
        reserved,
        selected: false,
        label: `${this.format(m)}`
      });
    }
  }

  selectSlot(slot: TimeSlot) {
    if (slot.reserved) return;

    // Start a new selection
    if (!this.selectedStart || this.selectedEnd) {
      this.clearSelection();
      this.selectedStart = slot;
      slot.selected = true;
      return;
    }

    // Prevents selecting a start time after an end time
    if (slot.start <= this.selectedStart.start) {
      this.clearSelection();
      this.selectedStart = slot;
      slot.selected = true;
      return;
    }

    // Check if any reserved slots exist between start and chosen end
    const hasCollision = this.timeSlots.some(s =>
      s.reserved && s.start >= this.selectedStart!.start && s.end <= slot.end
    );

    if (hasCollision) {
      this.snackbar.error('Selection overlaps with existing reservation');
      return;
    }

    this.selectedEnd = slot;
    this.highlightRange();
    this.applyReservationTime();
  }

  highlightRange() {
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
      this.snackbar.error('Please select a time range');
      return;
    }

    const payload = {
      item: this.itemId,
      user: this.reservation.user || null, // API handles null as unregistered
      date: this.reservation.date,
      startHour: this.reservation.startHour,
      startMinute: this.reservation.startMinute,
      endHour: this.reservation.endHour,
      endMinute: this.reservation.endMinute,
      isPaid: this.reservation.isPaid ? 1 : 0
    };

    this.itemManagementService.reserveitem(payload).subscribe({
      next: () => {
        this.snackbar.success('Reservation successful');
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

  loadReservations() {
    this.itemManagementService
      .getAllReservationsForItem(this.itemId)
      .subscribe(res => {
        this.allReservations = res;
        this.onDateChange();
      });
  }

  get isSelectionComplete(): boolean {
    return !!(this.selectedStart && this.selectedEnd);
  }
}