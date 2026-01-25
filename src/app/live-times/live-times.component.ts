import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnDestroy
} from '@angular/core';
import { Router } from '@angular/router';
import { ItemManagementService } from '../features/auth/services/itemManagement.service';
import { ItemsService } from '../features/auth/services/items.service';
import { SnackbarService } from '../features/auth/services/snack-bar.service';
import { BranchItem } from '../interfaces/shared-interfaces';
import { FormsModule } from '@angular/forms';

interface LiveItemStatus {
  itemId: string;
  name: string;
  isBusy: boolean;
  remainingSeconds?: number;
  endsAt?: string;
  activeReservation?: any; // added for mark as paid
  fullName:string;
  mobile:string;
  isPaid:number;
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
  timer!: any;
  
  editItemId: string | null = null;
  updatedItemName = '';

  constructor(
    private itemManagementService: ItemManagementService,
    private itemsService: ItemsService,
    private snackbar: SnackbarService,
    private router: Router
  ) {}

  ngOnChanges(): void {
    this.getAllReservations()
  }

  getAllReservations(){
    if (!this.items?.length) return;

    const ids = this.items.map(i => i._id);
    this.itemManagementService
      .getAllItemsReservationsForToday(ids)
      .subscribe(res => {
        this.reservations = res;
        this.startTimer();
      });
  }

  trackByItemId(index: number, item: LiveItemStatus): string {
    return item.itemId;
  }

  startTimer() {
    this.updateStatuses();
    clearInterval(this.timer);
    this.timer = setInterval(() => this.updateStatuses(), 1000);
  }

  

  updateStatuses() {
    if (this.editItemId) return;
    const now = new Date();
    const nowSec =
      now.getHours() * 3600 +
      now.getMinutes() * 60 +
      now.getSeconds();

this.itemStatuses = this.items.map(item => {
  const r = this.reservations.find(res => {
    if (res.item._id !== item._id) return false;

    const s = res.startHour * 3600 + res.startMinute * 60;
    const e = res.endHour * 3600 + res.endMinute * 60;

    return nowSec >= s && nowSec < e;
  });

  if (!r) {
    return {
      itemId: item._id,
      name: item.name,
      isBusy: false,
      fullName: '',  // no user if free
      mobile: '',
      isPaid:0
    };
  }

  const endSec = r.endHour * 3600 + r.endMinute * 60;
  const remaining = Math.max(endSec - nowSec, 0);

  if (remaining === 1) {
    console.log('⏰ 1 second left', {
      reservation: r,  
      item: item,     
      user: r.user    
    });

    let acceptedByAdminId = r.acceptedBy
    let userEmail = r.user.email
    let userName = r.user.fullName
    let userMobile = r.user.mobileNumber
    let finishedTime = (r.endHour < 10 ? '0' + r.endHour : r.endHour) + ':' + (r.endMinute < 10 ? '0' + r.endMinute : r.endMinute)
    let startedTime = (r.startHour < 10 ? '0' + r.startHour : r.startHour) + ':' + (r.startMinute < 10 ? '0' + r.startMinute : r.startMinute)
    console.log(acceptedByAdminId,userEmail,userName,userMobile,finishedTime,startedTime)

    let subject = 'Your play time is finished'
    let text = `Dear ${userName} your play time is finished. start time - ${startedTime}, finished time - ${finishedTime}. Share our website and get additional 15 minutes. - www.facebook.com`

    this.itemManagementService.sendMailWhenReservationIsFinished(userEmail, subject, text).subscribe(res => {
     if(res.statusCode) {
      this.snackbar.success('Notification about finished reservation sent successfuly')
     } else {
      this.snackbar.error(res.errors)
     }
    })
  }

  return {
    itemId: item._id,
    name: item.name,
    isBusy: true,
    remainingSeconds: remaining,
    endsAt: this.formatTime(endSec),
    activeReservation: r, // store active reservation
    fullName: r.user?.fullName || '',  // <-- added
    mobile: r.user?.mobileNumber || '',       // <-- added
    isPaid:r.isPaid
  };
});

  }

  formatTime(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  formatRemaining(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0
      ? `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
      : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  /* ================= ACTIONS ================= */

  onManageItemTime(itemId: string) {
    this.router.navigate(['/admin/item/manage', itemId]);
  }

  startEdit(item: LiveItemStatus) {
    this.editItemId = item.itemId;
    this.updatedItemName = item.name;
  }

  cancelEdit() {
    this.editItemId = null;
    this.updatedItemName = '';
  }

  updateItem(itemId: string) {
    this.itemsService.updateItem(itemId, this.updatedItemName).subscribe({
      next: () => {
        this.snackbar.success('Item updated successfully');
        this.cancelEdit();
        this.itemsChanged.emit();
      },
      error: () => {
        this.snackbar.error('Failed to update item');
      }
    });
  }

  deleteItem(itemId: string) {
    this.itemsService.deleteItem(itemId).subscribe({
      next: () => {
        this.snackbar.success('Item deleted');
        this.itemsChanged.emit();
      },
      error: () => {
        this.snackbar.error('Failed to delete item');
      }
    });
  }

  // ------------------ MARK AS PAID ------------------
  markAsPaid(item: LiveItemStatus) {
    if (!item.activeReservation) return;
    console.log('MARK AS PAID → ACTIVE RESERVATION:', item.activeReservation);
    this.itemManagementService.markItemAsPaid(item.activeReservation._id).subscribe(res => {
      if(res.statusCode == 200) {
        this.getAllReservations()
        this.snackbar.success('Marked as paid (check console)');
      } else {
        this.snackbar.error(res.errorMessage)
      }
    })
    
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}
