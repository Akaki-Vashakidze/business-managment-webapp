import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ItemManagement, User } from '../../../interfaces/shared-interfaces';
import { UserService } from '../../auth/services/user.service';
import { ItemManagementService } from '../../auth/services/itemManagement.service';
import { SnackbarService } from '../../auth/services/snack-bar.service';

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
export class ItemManagementComponent implements OnInit {

  item!: string;
  users: User[] = [];

  quickDate: 'today' | 'tomorrow' | 'dayAfter' | null = null;

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
    private snackbar: SnackbarService
  ) {}

  ngOnInit(): void {
    this.item = this.route.snapshot.paramMap.get('id')!;
    this.getAllUsers();

    // ✅ DEFAULT DATE = TODAY
    this.setDateByOffset(0);

    this.loadReservations();
  }

  getAllUsers() {
    this.userService.getAllUsers().subscribe(u => this.users = u);
  }

  // QUICK DATE HANDLING
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

    this.reservation.date = d.toISOString().split('T')[0];
    this.onDateChange();
  }

  onManualDateChange() {
    this.quickDate = null;
    this.onDateChange();
  }

  onDateChange() {
    const selected = new Date(this.reservation.date).toDateString();

    this.dayReservations = this.allReservations.filter(r =>
      new Date(r.date).toDateString() === selected
    );

    this.buildSlots();
  }

  buildSlots() {
    this.timeSlots = [];
    this.clearSelection();

    // ⏱ 15-minute slots from 12:00 → 24:00
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
        label: `${this.format(m)} - ${this.format(end)}`
      });
    }
  }

  selectSlot(slot: TimeSlot) {
    if (slot.reserved) return;

    if (!this.selectedStart || this.selectedEnd) {
      this.clearSelection();
      this.selectedStart = slot;
      slot.selected = true;
      return;
    }

    if (slot.start <= this.selectedStart.start) return;

    const invalid = this.timeSlots.some(s =>
      s.reserved &&
      s.start >= this.selectedStart!.start &&
      s.end <= slot.end
    );

    if (invalid) return;

    this.selectedEnd = slot;

    this.timeSlots.forEach(s => {
      if (s.start >= this.selectedStart!.start && s.end <= slot.end) {
        s.selected = true;
      }
    });

    this.applyReservationTime();
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
      this.snackbar.error('Select time interval');
      return;
    }

    const payload = {
      item: this.item,
      user: this.reservation.user,
      date: this.reservation.date,
      startHour: this.reservation.startHour,
      startMinute: this.reservation.startMinute,
      endHour: this.reservation.endHour,
      endMinute: this.reservation.endMinute,
      isPaid: this.reservation.isPaid ? 1 : 0
    };

    this.itemManagementService.reserveitem(payload).subscribe({
      next: () => {
        this.snackbar.success('Reserved successfully');
        this.loadReservations();
        this.clearSelection();
      },
      error: () => this.snackbar.error('Reservation failed')
    });
  }

  format(min: number) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  loadReservations() {
    this.reservation.isPaid = false;
    this.reservation.user = '';

    this.itemManagementService
      .getAllReservationsForItem(this.item)
      .subscribe(res => {
        this.allReservations = res;
        this.onDateChange();
      });
  }
}
