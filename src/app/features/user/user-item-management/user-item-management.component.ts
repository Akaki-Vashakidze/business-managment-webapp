import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ItemManagementService } from '../../auth/services/itemManagement.service';
import { SnackbarService } from '../../auth/services/snack-bar.service';
import { User } from '../../../interfaces/shared-interfaces';
import { SiteService } from '../../auth/services/site.service';

interface TimeSlot {
  start: number;
  end: number;
  label: string;
  reserved: boolean;
  selected: boolean;
}

@Component({
  selector: 'app-user-item-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-item-management.component.html',
  styleUrl: './user-item-management.component.scss'
})
export class UserItemManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  itemId!: string;
  slotTime: string | null = null;
  dateTabs: any[] = [];
  timeSlots: TimeSlot[] = [];
  allReservations: any[] = [];
  loadingReservations = false;

  // Configuration for Default Business Hours
  readonly DEFAULT_START = 12 * 60; // 12:00 PM
  readonly DEFAULT_END = 24 * 60;   // 12:00 AM

  reservation = {
    date: '',
    isPaid: false
  };

  selectedStart: TimeSlot | null = null;
  selectedEnd: TimeSlot | null = null;
  user!: User;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private itemService: ItemManagementService,
    private snackbar: SnackbarService,
    private siteService: SiteService
  ) {}

  ngOnInit(): void {
    this.itemId = this.route.snapshot.paramMap.get('itemId')!;
    this.slotTime = this.route.snapshot.paramMap.get('slotTIme');

    this.generateDateTabs();
    // On first load, use the URL date or default to today
    this.reservation.date = this.dateTabs[0].full;
    this.loadReservations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  generateDateTabs() {
    this.dateTabs = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      this.dateTabs.push({
        full: d.toISOString().split('T')[0],
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.getDate()
      });
    }
  }

  // UPDATED: When a date tab is clicked, we clear the specific slot filter
  setQuickDateTab(date: string) {
    this.reservation.date = date;
    this.slotTime = null; // Clear the URL-based filter to show all slots
    this.clearSelection();
    this.buildSlots();
  }

  loadReservations() {
    this.loadingReservations = true;
    this.itemService.getAllReservationsForItem(this.itemId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.allReservations = res;
          this.buildSlots();
          this.loadingReservations = false;
        },
        error: () => {
          this.loadingReservations = false;
          this.snackbar.error('Could not fetch station availability');
        }
      });
  }

  buildSlots() {
    this.timeSlots = [];
    const selectedDateStr = new Date(this.reservation.date).toDateString();
    const dayRes = this.allReservations.filter(r => 
      new Date(r.date).toDateString() === selectedDateStr
    );

    let limitStart: number | null = null;
    let limitEnd: number | null = null;

    // Only parse the slot limit if slotTime exists (it gets cleared when clicking a date tab)
    if (this.slotTime && this.slotTime.includes('-')) {
      const parts = this.slotTime.split('-');
      limitStart = this.parseTimeToMinutes(parts[0]);
      limitEnd = this.parseTimeToMinutes(parts[1]);
    }

    // Dynamic start based on whether we have a filter or default hours
    const loopStart = (limitStart !== null && limitStart < this.DEFAULT_START) 
      ? limitStart 
      : this.DEFAULT_START;

    const loopEnd = (limitEnd !== null && limitEnd > this.DEFAULT_END)
      ? limitEnd
      : this.DEFAULT_END;

    for (let m = loopStart; m < loopEnd; m += 15) {
      const end = m + 15;

      // Filter logic: Only apply if limitStart exists
      if (limitStart !== null && limitEnd !== null) {
        if (m < limitStart || end > limitEnd) continue;
      }

      const reserved = dayRes.some(r => {
        const rs = r.startHour * 60 + r.startMinute;
        const re = r.endHour * 60 + r.endMinute;
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

    if (limitStart !== null && limitEnd !== null) {
      this.autoSelectRequestedRange(limitStart, limitEnd);
    }
  }

  private autoSelectRequestedRange(start: number, end: number) {
    const startSlot = this.timeSlots.find(s => s.start === start);
    const endSlot = this.timeSlots.find(s => s.end === end);

    if (startSlot && endSlot && !this.isRangeReserved(start, end)) {
      this.selectedStart = startSlot;
      this.selectedEnd = endSlot;
      this.highlightRange();
    }
  }

  isRangeReserved(start: number, end: number): boolean {
    const selectedDateStr = new Date(this.reservation.date).toDateString();
    return this.allReservations.some(r => {
      if (new Date(r.date).toDateString() !== selectedDateStr) return false;
      const rs = r.startHour * 60 + r.startMinute;
      const re = r.endHour * 60 + r.endMinute;
      return (start < re && end > rs);
    });
  }

  private parseTimeToMinutes(timeStr: string): number {
    const [hrs, mins] = timeStr.split(':').map(Number);
    return (hrs * 60) + mins;
  }

  selectSlot(slot: TimeSlot) {
    if (slot.reserved) return;

    if (!this.selectedStart || this.selectedEnd) {
      this.clearSelection();
      this.selectedStart = slot;
      slot.selected = true;
    } else {
      if (slot.start <= this.selectedStart.start) {
        this.clearSelection();
        this.selectedStart = slot;
        slot.selected = true;
      } else {
        const hasCollision = this.timeSlots.some(s => 
          s.reserved && s.start >= this.selectedStart!.start && s.end <= slot.end
        );

        if (hasCollision) {
          this.snackbar.error('Selection overlaps with existing reservation');
          return;
        }

        this.selectedEnd = slot;
        this.highlightRange();
      }
    }
  }

  highlightRange() {
    this.timeSlots.forEach(s => {
      s.selected = s.start >= this.selectedStart!.start && s.end <= this.selectedEnd!.end;
    });
  }

  clearSelection() {
    this.selectedStart = null;
    this.selectedEnd = null;
    this.timeSlots.forEach(s => s.selected = false);
  }

  reserveItem() {
    if (!this.selectedStart || !this.selectedEnd) return;

    const payload = {
      item: this.itemId,
      date: this.reservation.date,
      startHour: Math.floor(this.selectedStart.start / 60),
      startMinute: this.selectedStart.start % 60,
      endHour: Math.floor(this.selectedEnd.end / 60),
      endMinute: this.selectedEnd.end % 60,
      isPaid: this.reservation.isPaid ? 1 : 0,
    };

    this.siteService.reserveitem(payload).subscribe({
      next: () => {
        this.snackbar.success('Reserved Successfully!');
        this.router.navigate(['/user/dashboard']);
      },
      error: (err: any) => this.snackbar.error(err.error?.message || 'Failed to reserve')
    });
  }

  format(min: number) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  goBack() { 
    this.router.navigate(['/user/dashboard']); 
  }
}