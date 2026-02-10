import { Component, OnDestroy, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SiteService } from '../../auth/services/site.service';
import { interval, startWith, Subscription, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-item-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './item-reservations.component.html',
  styleUrl: './item-reservations.component.scss'
})
export class ItemReservationsComponent implements OnInit, OnDestroy {
  @Input() items: any[] = [];
  @Input() reservations: any[] = [];
  @Output() statsUpdated = new EventEmitter<{available: number, total: number}>();

  user: any = null;
  branches: any[] = [];
  selectedBranchId: string | null = null;
  selectedDate: string = new Date().toISOString().split('T')[0];
  
  loading: boolean = true;
  loadingItems: boolean = false;
  dateTabs: any[] = [];

  openingHour = 9;
  closingHour = 24;

  private refreshSub?: Subscription;

  constructor(private siteService: SiteService, private router: Router) {}

  ngOnInit() {
    this.generateDateTabs();
    const stored = localStorage.getItem('businesManagement_user');
    this.user = stored ? JSON.parse(stored) : null;
    if (this.user?.business) {
      this.fetchBranches();
    }
  }

  ngOnDestroy() {
    if (this.refreshSub) this.refreshSub.unsubscribe();
  }

  generateDateTabs() {
    this.dateTabs = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      this.dateTabs.push({
        full: d.toISOString().split('T')[0],
        day: days[d.getDay()],
        date: d.getDate()
      });
    }
  }

  fetchBranches() {
    this.siteService.getBranchesByBusiness(this.user.business).subscribe({
      next: (res: any) => {
        this.branches = res.result.data;
        if (this.branches.length > 0) this.selectBranch(this.branches[0]._id);
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onDateChange(date: string) {
    this.selectedDate = date;
    if (this.selectedBranchId) this.selectBranch(this.selectedBranchId);
  }

  selectBranch(branchId: string) {
    this.selectedBranchId = branchId;
    this.loadingItems = true;
    if (this.refreshSub) this.refreshSub.unsubscribe();

    this.refreshSub = interval(20000)
      .pipe(startWith(0), switchMap(() => this.siteService.getItemsReservations({
        branchId: this.selectedBranchId || '',
        date: this.selectedDate
      })))
      .subscribe(
        {
        next: (res: any) => {
          this.items = res.result.data.items;
          this.reservations = res.result.data.reservations;
          this.updateParentStats();
          this.loadingItems = false;
        },
        error: () => this.loadingItems = false
      }
    );
  }

  isItemBusyNow(itemId: string): boolean {
    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
    return this.reservations.some(r => {
      if (r.item._id !== itemId) return false;
      const start = r.startHour * 60 + r.startMinute;
      const end = r.endHour * 60 + r.endMinute;
      return currentTotalMinutes >= start && currentTotalMinutes < end;
    });
  }

  updateParentStats() {
    const busyCount = this.items.filter(item => this.isItemBusyNow(item._id)).length;
    this.statsUpdated.emit({ available: this.items.length - busyCount, total: this.items.length });
  }

  getTimeline(itemId: string) {
    const res = this.reservations
      .filter(r => r.item._id === itemId)
      .sort((a, b) => (a.startHour * 60 + a.startMinute) - (b.startHour * 60 + b.startMinute));
    
    const timeline: any[] = [];
    let lastEnd = this.openingHour * 60;

    res.forEach(r => {
      const start = r.startHour * 60 + r.startMinute;
      if (start > lastEnd) {
        timeline.push({ start: this.minutesToTime(lastEnd), end: this.minutesToTime(start), isFree: true });
      }
      timeline.push({ start: this.minutesToTime(start), end: this.minutesToTime(r.endHour * 60 + r.endMinute), isFree: false });
      lastEnd = r.endHour * 60 + r.endMinute;
    });

    if (lastEnd < this.closingHour * 60) {
      timeline.push({ start: this.minutesToTime(lastEnd), end: this.minutesToTime(this.closingHour * 60), isFree: true });
    }
    return timeline;
  }

  private minutesToTime(totalMinutes: number): string {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}:${m.toString().padStart(2, '0')}`;
  }

  handleReserve(itemId: string, slot?: any) {
    if(slot) {
      this.router.navigate([`user/reservations/${itemId}/${slot.start}-${slot.end}`])
    } else {
      this.router.navigate([`user/reservations/${itemId}`])
    }
  }
}