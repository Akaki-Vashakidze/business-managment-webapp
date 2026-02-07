import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ItemManagementService } from '../features/auth/services/itemManagement.service';
import { ItemsService } from '../features/auth/services/items.service';
import { SnackbarService } from '../features/auth/services/snack-bar.service';
import { BranchItem } from '../interfaces/shared-interfaces';

interface LiveItemStatus {
  itemId: string;
  name: string;
  isBusy: boolean;
  remainingSeconds?: number;
  endsAt?: string;
  activeReservation?: any;
  fullName: string;
  mobile: string;
  isPaid: number;
}

@Component({
  selector: 'app-live-times',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './live-times.component.html',
  styleUrls: ['./live-times.component.scss']
})
export class LiveTimesComponent implements OnChanges, OnDestroy {
  @Input() items!: BranchItem[];
  @Output() itemsChanged = new EventEmitter<void>();

  itemStatuses: LiveItemStatus[] = [];
  reservations: any[] = [];
  timer: any;
  
  editItemId: string | null = null;
  updatedItemName = '';

  constructor(
    private itemManagementService: ItemManagementService,
    private itemsService: ItemsService,
    private snackbar: SnackbarService,
    private router: Router
  ) {}

  ngOnChanges(): void {
    this.getAllReservations();
  }

  getAllReservations() {
    if (!this.items?.length) return;
    const ids = this.items.map(i => i._id);
    this.itemManagementService
      .getAllItemsReservationsForToday(ids)
      .subscribe(res => {
        console.log('Fetched Reservations:', res); // 👈 Debug check
        this.reservations = res;
        this.startTimer();
      });
  }

  startTimer() {
    if (this.timer) clearInterval(this.timer);
    this.updateStatuses();
    this.timer = setInterval(() => this.updateStatuses(), 1000);
  }

  updateStatuses() {
    if (this.editItemId) return;

    const now = new Date();
    const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    this.itemStatuses = this.items.map(item => {
      const r = this.reservations.find(res => {
        // 1. Match ID
        if (res.item._id !== item._id) return false;

        // 2. Time Logic
        let s = res.startHour * 3600 + res.startMinute * 60;
        let e = res.endHour * 3600 + res.endMinute * 60;

        // Midnight Correction: If end is 00:16, it becomes 24:16
        if (e <= s) e += 86400;

        // Check if current time falls within this range
        const isActive = nowSec >= s && nowSec < e;
        
        return isActive;
      });

      if (!r) {
        return {
          itemId: item._id, name: item.name, isBusy: false,
          fullName: '', mobile: '', isPaid: 0
        };
      }

      let endSec = r.endHour * 3600 + r.endMinute * 60;
      if (endSec <= (r.startHour * 3600 + r.startMinute * 60)) endSec += 86400;

      const remaining = Math.max(endSec - nowSec, 0);

      if (remaining === 1) {
        this.snackbar.success(`${r.user?.fullName || 'Gamer'} finished!`);
      }

      return {
        itemId: item._id,
        name: item.name,
        isBusy: true,
        remainingSeconds: remaining,
        endsAt: this.formatTime(r.endHour * 3600 + r.endMinute * 60),
        activeReservation: r,
        fullName: r.user?.fullName || 'Walk-in Customer',
        mobile: r.user?.mobileNumber || 'N/A',
        isPaid: r.isPaid
      };
    });
  }

  formatTime(totalSeconds: number): string {
    const normalized = totalSeconds % 86400;
    const h = Math.floor(normalized / 3600);
    const m = Math.floor((normalized % 3600) / 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  formatRemaining(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 
      ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` 
      : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  /* --- ACTIONS --- */
  onManageItemTime(itemId: string) { this.router.navigate(['/admin/item/manage', itemId]); }
  startEdit(item: LiveItemStatus) { this.editItemId = item.itemId; this.updatedItemName = item.name; }
  cancelEdit() { this.editItemId = null; }

  updateItem(itemId: string) {
    this.itemsService.updateItem(itemId, this.updatedItemName).subscribe(() => {
      this.snackbar.success('Updated');
      this.cancelEdit();
      this.itemsChanged.emit();
    });
  }

  deleteItem(itemId: string) {
    if(confirm('Delete station?')) {
      this.itemsService.deleteItem(itemId).subscribe(() => this.itemsChanged.emit());
    }
  }

  markAsPaid(item: LiveItemStatus) {
    if (!item.activeReservation) return;
    this.itemManagementService.markItemAsPaid(item.activeReservation._id).subscribe(res => {
      if (res.statusCode == 200) {
        this.getAllReservations();
        this.snackbar.success('Paid');
      }
    });
  }

  ngOnDestroy(): void { if (this.timer) clearInterval(this.timer); }
  trackByItemId(index: number, item: LiveItemStatus): string { return item.itemId; }
}