import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SiteService } from '../../auth/services/site.service';
import { ItemReservationsComponent } from "../item-reservations/item-reservations.component";
import { UserService } from '../../auth/services/user.service';
import { ItemManagement } from '../../../interfaces/shared-interfaces';
import { Subject, takeUntil } from 'rxjs';
import { SnackbarService } from '../../auth/services/snack-bar.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, ItemReservationsComponent, TranslateModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  availableCount: number = 0;
  totalItems: number = 0;
  myReservations: ItemManagement[] = [];
  @ViewChild(ItemReservationsComponent) childComponent!: ItemReservationsComponent;
  constructor(private userService: UserService, private snackbarService:SnackbarService, private siteService: SiteService) {}

  ngOnInit(): void {
    this.loadMyReservations();
  }

  refreshChildData() {
    if (this.childComponent.selectedBranchId) {
      this.childComponent.selectBranch(this.childComponent.selectedBranchId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMyReservations() {
    this.siteService.getMyReservations()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.myReservations = result;
        console.log(this.myReservations)
      });
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
      if(res.statusCode != 200) {
          this.snackbarService.error(res.errors)
      } else {
        this.loadMyReservations();
        this.refreshChildData()
        this.snackbarService.success('deleted')
      }
    })
  }
}
