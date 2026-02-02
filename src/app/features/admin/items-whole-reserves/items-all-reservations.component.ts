import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ItemManagementService } from '../../auth/services/itemManagement.service';
import { SnackbarService } from '../../auth/services/snack-bar.service';
import { FormsModule } from '@angular/forms';
import { User } from '../../../interfaces/shared-interfaces';
import { UserService } from '../../auth/services/user.service';
import { BusinessService } from '../../auth/services/business.service';
import { Subject, takeUntil } from 'rxjs';

interface TimeSlot {
  start: number;
  end: number;
  label: string;
  free: boolean;
  selected: boolean;
}

@Component({
  selector: 'app-items-all-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './items-all-reservations.component.html',
  styleUrls: ['./items-all-reservations.component.scss']
})
export class ItemsWholeReservesComponent implements OnInit, OnChanges, OnDestroy {
  private destroy$ = new Subject<void>();
  isPaid: boolean = false;
  rangeStart: TimeSlot | null = null;
  rangeEnd: TimeSlot | null = null;

  @Input() itemsIds!: string[];

  allReservations: any[] = [];
  timeSlots: TimeSlot[] = [];
  selectedDate: string = '';
  users: User[] = [];
  selectedUser!: string;

  quickDate: 'today' | 'tomorrow' | 'dayAfter' | null = null;

  constructor(
    private itemManagementService: ItemManagementService,
    private snackbar: SnackbarService,
    private userService: UserService,
    private businessService:BusinessService
  ) {

    businessService.businessSelected.pipe(takeUntil(this.destroy$)).subscribe(item => {
      this.getAllUsers(item?._id || '');
    })
  }

  

  ngOnInit(): void {

    // ✅ default date = today
    this.setDateByOffset(0);

    if (this.itemsIds && this.itemsIds.length) {
      this.loadReservations(this.itemsIds);
    }
  }

  ngOnChanges(): void {
    if (this.itemsIds && this.itemsIds.length) {
      this.loadReservations(this.itemsIds);
    }
  }

  getAllUsers(businessId:string) {
    this.userService.getAllUsers(businessId).subscribe(u => this.users = u);
  }

  /* ================= DATE LOGIC ================= */

  setQuickDate(type: 'today' | 'tomorrow' | 'dayAfter') {
    if (this.quickDate === type) {
      this.quickDate = null;
      return;
    }

    this.quickDate = type;

    if (type === 'today') this.setDateByOffset(0);
    if (type === 'tomorrow') this.setDateByOffset(1);
    if (type === 'dayAfter') this.setDateByOffset(2);
  }

  setDateByOffset(days: number) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    this.selectedDate = d.toISOString().split('T')[0];
    this.onDateChange();
  }

  onManualDateChange() {
    this.quickDate = null;
    this.onDateChange();
  }

  /* ================= DATA ================= */

  loadReservations(ids: string[]) {
    this.itemManagementService.getAllItemsReservations(ids).subscribe(res => {
      this.allReservations = res;
      this.buildSlots();
    });
  }

  onDateChange() {
    this.buildSlots();
  }

  buildSlots() {
    this.timeSlots = [];
    this.clearSelection();

    const slotDuration = 15;
    const startMinutes = 12 * 60;
    const endMinutes = 24 * 60;

    for (let m = startMinutes; m < endMinutes; m += slotDuration) {
      const slotEnd = m + slotDuration;

      const free = this.itemsIds.some(itemId => {
        return !this.allReservations.some(r => {
          const rDate = new Date(r.date).toISOString().split('T')[0];
          if (r.item._id !== itemId || rDate !== this.selectedDate) return false;

          const rStart = r.startHour * 60 + r.startMinute;
          const rEnd = r.endHour * 60 + r.endMinute;

          return m < rEnd && slotEnd > rStart;
        });
      });

      this.timeSlots.push({
        start: m,
        end: slotEnd,
        label: `${this.formatTime(m)} - ${this.formatTime(slotEnd)}`,
        free,
        selected: false
      });
    }
  }

  formatTime(min: number): string {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  /* ================= SLOT SELECTION ================= */

  selectSlot(slot: TimeSlot) {
    if (!slot.free) return;

    if (!this.rangeStart || this.rangeEnd) {
      this.clearSelection();
      slot.selected = true;
      this.rangeStart = slot;
      this.rangeEnd = null;
      return;
    }

    if (slot.start < this.rangeStart.start) {
      this.clearSelection();
      slot.selected = true;
      this.rangeStart = slot;
      return;
    }

    const slotsInRange = this.timeSlots.filter(
      s => s.start >= this.rangeStart!.start && s.end <= slot.end
    );

    if (slotsInRange.some(s => !s.free)) return;

    slotsInRange.forEach(s => s.selected = true);
    this.rangeEnd = slot;
  }

  clearSelection() {
    this.timeSlots.forEach(s => s.selected = false);
    this.rangeStart = null;
    this.rangeEnd = null;
  }

  /* ================= RESERVE ================= */

  reserveSelected() {
    if (!this.rangeStart || !this.rangeEnd) {
      this.snackbar.error('Please select a time range first');
      return;
    }

    const start = this.rangeStart.start;
    const end = this.rangeEnd.end;

    const freeItem = this.itemsIds.find(itemId => {
      return !this.allReservations.some(r => {
        const rDate = new Date(r.date).toISOString().split('T')[0];
        if (r.item._id !== itemId || rDate !== this.selectedDate) return false;

        const rStart = r.startHour * 60 + r.startMinute;
        const rEnd = r.endHour * 60 + r.endMinute;

        return start < rEnd && end > rStart;
      });
    });

    if (!freeItem) {
      this.snackbar.error('No item is free for this time range');
      return;
    }

    const payload = {
      item: freeItem,
      user: this.selectedUser || null,
      date: this.selectedDate,
      startHour: Math.floor(start / 60),
      startMinute: start % 60,
      endHour: Math.floor(end / 60),
      endMinute: end % 60,
      isPaid: this.isPaid ? 1 : 0
    };

    this.itemManagementService.reserveitem(payload).subscribe(res => {
      if (res.statusCode === 400) {
        this.snackbar.error(res.errors);
      } else {
        this.snackbar.success(`${res.reservation.item.name} დაიჯავშნა წარმატებით`);
        this.loadReservations(this.itemsIds);
        this.clearSelection();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
