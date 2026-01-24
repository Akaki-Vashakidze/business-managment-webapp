import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ItemManagementService } from '../../auth/services/itemManagement.service';
import { SnackbarService } from '../../auth/services/snack-bar.service';
import { FormsModule } from '@angular/forms';
import { User } from '../../../interfaces/shared-interfaces';
import { UserService } from '../../auth/services/user.service';

interface TimeSlot {
  start: number; // minutes
  end: number;   // minutes
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
export class ItemsWholeReservesComponent implements OnInit, OnChanges {
rangeStart: TimeSlot | null = null;
rangeEnd: TimeSlot | null = null;
  @Input() itemsIds!: string[];

  allReservations: any[] = [];
  timeSlots: TimeSlot[] = [];
  selectedSlot: TimeSlot | null = null;
  selectedDate: string = new Date().toISOString().split('T')[0]; // today
  users: User[] = [];
  selectedUser!:string;
  constructor(
    private itemManagementService: ItemManagementService,
    private snackbar: SnackbarService,
    private userService:UserService
  ) {}

  getAllUsers() {
    this.userService.getAllUsers().subscribe(u => this.users = u);
  }

  ngOnInit(): void {
    if (this.itemsIds && this.itemsIds.length){ this.loadReservations(this.itemsIds)};
    this.getAllUsers()
  }

  ngOnChanges(): void {
    if (this.itemsIds && this.itemsIds.length) this.loadReservations(this.itemsIds);
  }

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
    this.selectedSlot = null;

    // we will make slots from 12:00 to 24:00 (12pm to midnight)
    const slotDuration = 15; // 15-min slots
    const startMinutes = 12 * 60;
    const endMinutes = 24 * 60;

    for (let m = startMinutes; m < endMinutes; m += slotDuration) {
      const slotEnd = m + slotDuration;

      // check if slot is free in **any item**
      const free = this.itemsIds.some(itemId => {
        return !this.allReservations.some(r => {
          const rDate = new Date(r.date).toISOString().split('T')[0];
          const slotDate = this.selectedDate;
          if (r.item._id !== itemId || rDate !== slotDate) return false;

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

selectSlot(slot: TimeSlot) {
  if (!slot.free) return;

  // First click → start
  if (!this.rangeStart || (this.rangeStart && this.rangeEnd)) {
    this.clearSelection();
    slot.selected = true;
    this.rangeStart = slot;
    this.rangeEnd = null;
    return;
  }

  // Second click → end
  if (this.rangeStart && !this.rangeEnd) {
    if (slot.start < this.rangeStart.start) {
      // clicked before start → reset
      this.clearSelection();
      slot.selected = true;
      this.rangeStart = slot;
      return;
    }

    // check all slots between are free
    const slotsInRange = this.timeSlots.filter(
      s => s.start >= this.rangeStart!.start && s.end <= slot.end
    );

    if (slotsInRange.some(s => !s.free)) {
      return; // block selection if busy slot exists
    }

    // select full range
    slotsInRange.forEach(s => (s.selected = true));
    this.rangeEnd = slot;
  }
}

clearSelection() {
  this.timeSlots.forEach(s => (s.selected = false));
  this.rangeStart = null;
  this.rangeEnd = null;
}

reserveSelected() {
  if (!this.rangeStart || !this.rangeEnd) {
    this.snackbar.error('Please select a time range first');
    return;
  }

  const start = this.rangeStart.start;
  const end = this.rangeEnd.end;

  // find ANY free item for the WHOLE RANGE
  const freeItem = this.itemsIds.find(itemId => {
    return !this.allReservations.some(r => {
      const rDate = new Date(r.date).toISOString().split('T')[0];
      if (r.item._id !== itemId || rDate !== this.selectedDate) return false;

      const rStart = r.startHour * 60 + r.startMinute;
      const rEnd = r.endHour * 60 + r.endMinute;

      // overlap check
      return start < rEnd && end > rStart;
    });
  });

  if (!freeItem) {
    this.snackbar.error('No item is free for this time range');
    return;
  }

  const payload = {
    item: freeItem,
    user: this.selectedUser,
    date: this.selectedDate,
    startHour: Math.floor(start / 60),
    startMinute: start % 60,
    endHour: Math.floor(end / 60),
    endMinute: end % 60,
    isPaid: 0
  };
  console.log(payload)
  this.itemManagementService.reserveitem(payload).subscribe(item => {
    if(item.statusCode == 400 ) {
      this.snackbar.error(item.errors)
    } else {
      this.snackbar.success('Reserved successfully!');
      this.loadReservations(this.itemsIds);
      this.clearSelection();
    }
  });
}

}
