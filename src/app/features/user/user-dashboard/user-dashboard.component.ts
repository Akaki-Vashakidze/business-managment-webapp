import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core'; // Added OnDestroy
import { SiteService } from '../../auth/services/site.service';
import { interval, Subscription, startWith, switchMap } from 'rxjs'; // Added RxJS tools

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  user: any = null;
  branches: any[] = [];
  selectedBranchId: string | null = null;
  items: any[] = [];
  reservations: any[] = [];
  loading: boolean = true;
  loadingItems: boolean = false;

  openingHour = 9;
  closingHour = 22;

  // Subscription to track the 20-second timer
  private refreshSub?: Subscription;

  constructor(private siteService: SiteService) {}

  ngOnInit() {
    const stored = localStorage.getItem('businesManagement_user');
    this.user = stored ? JSON.parse(stored) : null;
    if (this.user?.business) {
      this.fetchBranches();
    }
  }

  // Cleanup the timer when component is destroyed
  ngOnDestroy() {
    if (this.refreshSub) {
      this.refreshSub.unsubscribe();
    }
  }

  fetchBranches() {
    this.siteService.getBranchesByBusiness(this.user.business).subscribe({
      next: (res: any) => {
        this.branches = res.result.data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  selectBranch(branchId: string) {
    this.selectedBranchId = branchId;

    // 1. Cancel existing timer if user switches branches
    if (this.refreshSub) {
      this.refreshSub.unsubscribe();
    }

    // 2. Start a new timer that runs every 20 seconds
    this.refreshSub = interval(20000)
      .pipe(
        startWith(0), // Run immediately upon selection
        switchMap(() => {
          console.log('Refreshing live data...');
          return this.siteService.getItemsReservations(branchId);
        })
      )
      .subscribe({
        next: (res: any) => {
          this.items = res.result.data.items;
          this.reservations = res.result.data.reservations;
          this.loadingItems = false;
        },
        error: (err) => console.error('Auto-refresh failed', err)
      });
  }

  getTimeline(itemId: string) {
    const res = this.reservations
      .filter(r => r.item._id === itemId)
      .sort((a, b) => (a.startHour * 60 + a.startMinute) - (b.startHour * 60 + b.startMinute));
    
    const timeline: { start: string, end: string, isFree: boolean }[] = [];
    let lastEnd = this.openingHour * 60;

    res.forEach(r => {
      const start = r.startHour * 60 + r.startMinute;
      if (start > lastEnd) {
        timeline.push({ 
          start: this.minutesToTime(lastEnd), 
          end: this.minutesToTime(start), 
          isFree: true 
        });
      }
      timeline.push({ 
        start: this.minutesToTime(start), 
        end: this.minutesToTime(r.endHour * 60 + r.endMinute), 
        isFree: false 
      });
      lastEnd = r.endHour * 60 + r.endMinute;
    });

    if (lastEnd < this.closingHour * 60) {
      timeline.push({ 
        start: this.minutesToTime(lastEnd), 
        end: this.minutesToTime(this.closingHour * 60), 
        isFree: true 
      });
    }
    return timeline;
  }

  private minutesToTime(totalMinutes: number): string {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}:${m.toString().padStart(2, '0')}`;
  }

  handleReserve(itemId: string, slot?: any) {
    console.log('Booking:', itemId, slot);
    alert(`Booking initiated for ${itemId}`);
  }
}