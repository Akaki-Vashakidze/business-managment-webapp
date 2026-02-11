import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SiteService } from '../../features/auth/services/site.service';
import { ItemReservationsComponent } from '../../features/user/item-reservations/item-reservations.component';
import { UserService } from '../../features/auth/services/user.service';
import { ItemManagement } from '../../interfaces/shared-interfaces';
import { Subject, takeUntil } from 'rxjs';
import { SnackbarService } from '../../features/auth/services/snack-bar.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ItemReservationsComponent, TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  availableCount: number = 0;
  totalItems: number = 0;
  myReservations: ItemManagement[] = [];

  constructor(private userService: UserService, private snackbarService:SnackbarService, private siteService: SiteService) {}

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  statsUpdated(event: any) {
    this.availableCount = event.available;
    this.totalItems = event.total;
  }

  // Helper to format time for the UI
  formatTime(h: number, m: number): string {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  deleteMyReservation(id:string){
    this.siteService.deleteMyReservation(id).subscribe(res => {
      console.log(res)
      if(res.errors) {
          this.snackbarService.error(res.errors)
      } else {
        this.snackbarService.success('deleted')
      }
    })
  }
}
