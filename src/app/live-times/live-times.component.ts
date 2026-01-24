import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { ItemManagementService } from '../features/auth/services/itemManagement.service';
import { BranchItem } from '../interfaces/shared-interfaces';

interface LiveItemStatus {
  itemId: string;
  name: string;
  isBusy: boolean;
  remainingSeconds?: number;
  endsAt?: string;
}

@Component({
  selector: 'app-live-times',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './live-times.component.html',
  styleUrl: './live-times.component.scss'
})
export class LiveTimesComponent implements OnChanges, OnDestroy {

  @Input() items!: BranchItem[];

  itemStatuses: LiveItemStatus[] = [];
  reservations: any[] = [];

  private timer!: any;

  constructor(private itemManagementService: ItemManagementService) {}

  ngOnChanges(): void {
    if (!this.items || !this.items.length) return;

    const itemIds = this.items.map(i => i._id);

    this.itemManagementService
      .getAllItemsReservationsForToday(itemIds)
      .subscribe(res => {
        this.reservations = res;
        this.startLiveTimer();
      });
  }

  startLiveTimer() {
    this.updateStatuses(); // immediate run

    if (this.timer) clearInterval(this.timer);

    this.timer = setInterval(() => {
      this.updateStatuses();
    }, 1000);
  }

  updateStatuses() {
    const now = new Date();
    const nowSeconds =
      now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    this.itemStatuses = this.items.map(item => {
      const activeReservation = this.reservations.find(r => {
        if (r.item._id !== item._id) return false;

        const start =
          r.startHour * 3600 + r.startMinute * 60;
        const end =
          r.endHour * 3600 + r.endMinute * 60;

        return nowSeconds >= start && nowSeconds < end;
      });

      if (!activeReservation) {
        return {
          itemId: item._id,
          name: item.name,
          isBusy: false
        };
      }

      const endSeconds =
        activeReservation.endHour * 3600 +
        activeReservation.endMinute * 60;

      const remaining = Math.max(endSeconds - nowSeconds, 0);

      return {
        itemId: item._id,
        name: item.name,
        isBusy: true,
        remainingSeconds: remaining,
        endsAt: this.formatTime(endSeconds)
      };
    });
  }

  formatTime(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  formatRemaining(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}


  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }
}
