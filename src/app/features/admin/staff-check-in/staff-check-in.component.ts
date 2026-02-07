import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { MembershipService } from '../../auth/services/membership.service';
import { CommonModule } from '@angular/common';
import { SnackbarService } from '../../auth/services/snack-bar.service';
import { ItemsService } from '../../auth/services/items.service';
import { ItemManagementService } from '../../auth/services/itemManagement.service';
import { BusinessService } from '../../auth/services/business.service';
import { BranchesService } from '../../auth/services/branches.service';
import { ItemManagement } from '../../../interfaces/shared-interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-staff-check-in',
  templateUrl: './staff-check-in.component.html',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './staff-check-in.component.scss'
})
export class StaffCheckInComponent implements OnInit, OnDestroy {
  @ViewChild('video', { static: true }) video!: ElementRef<HTMLVideoElement>;

  private codeReader = new BrowserMultiFormatReader();
  private controls?: IScannerControls; // Store controls here
  
  scanning = false;
  message = '';
  itemsIds: string[] = [];
  allReservations: any[] = [];
  itemManagementData!: ItemManagement;
  
  selectedBusinessId!: string;
  selectedBranchId!: string;

  constructor(
    private membershipService: MembershipService, 
    private router: Router, 
    private snackbar: SnackbarService, 
    private itemManagementService: ItemManagementService, 
    private itemsService: ItemsService, 
    private businessService: BusinessService, 
    private branchService: BranchesService
  ) {
    this.businessService.businessSelected.subscribe(business => {
      this.selectedBusinessId = business?._id || '';
    });

    this.branchService.selectedBranch.subscribe(branch => {
      this.selectedBranchId = branch?._id || '';
      if (this.selectedBranchId) this.getItemsByBranch();
    });
  }

  async ngOnInit() {
    await this.startScanner();
  }

  async startScanner() {
    if (this.scanning) return;
    this.scanning = true;

    try {
      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      const selectedDevice = videoInputDevices[0].deviceId;

      // decodeFromVideoDevice now returns controls
      this.controls = await this.codeReader.decodeFromVideoDevice(
        selectedDevice,
        this.video.nativeElement,
        (result, error, controls) => {
          if (result && this.scanning) {
            this.scanning = false;
            
            // ✅ This is the correct way to stop in @zxing/browser
            controls.stop(); 
            
            this.handleScan(result.getText());
          }
        }
      );
    } catch (err) {
      this.snackbar.error('Camera access denied');
    }
  }

  handleScan(qr: string) {
    this.message = 'Processing...';

    const canProceed = this.checkReservationData(qr);
    if (!canProceed) {
      this.restartScanner();
      return;
    }

    this.membershipService.checkIn(qr, this.selectedBusinessId, this.selectedBranchId, this.itemManagementData)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.snackbar.success('Check-in successful');
            this.router.navigate(['/admin/branchItems']);
          } else {
            this.snackbar.error(res.errors || 'Check-in failed');
            this.restartScanner();
          }
        },
        error: () => {
          this.snackbar.error('Server error');
          this.restartScanner();
        }
      });
  }

  checkReservationData(userId: string): boolean {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const todaysDate = now.toISOString().split('T')[0];

    const startMinutes = now.getHours() * 60 + now.getMinutes();
    const endMinutes = oneHourLater.getHours() * 60 + oneHourLater.getMinutes();

    const freeItem = this.itemsIds.find(itemId => {
      return !this.allReservations.some((r: any) => {
        const rDate = new Date(r.date).toISOString().split('T')[0];
        if (r.item._id !== itemId || rDate !== todaysDate) return false;
        
        const rStart = r.startHour * 60 + r.startMinute;
        const rEnd = r.endHour * 60 + r.endMinute;
        return startMinutes < rEnd && endMinutes > rStart;
      });
    });

    if (!freeItem) {
      this.snackbar.error('No free stations available');
      return false;
    }

    this.itemManagementData = {
      item: freeItem,
      user: userId,
      date: todaysDate,
      startHour: now.getHours(),
      startMinute: now.getMinutes(),
      endHour: oneHourLater.getHours(),
      endMinute: oneHourLater.getMinutes(),
      isPaid: 1
    };

    return true;
  }

  getItemsByBranch() {
    this.itemsService.getItemsByBranch(this.selectedBranchId).subscribe(items => {
      const itemsArr = items as any[] || [];
      this.itemsIds = itemsArr.map(i => i._id);
      this.loadReservations(this.itemsIds);
    });
  }

  loadReservations(ids: string[]) {
    this.itemManagementService.getAllItemsReservations(ids).subscribe(res => {
      this.allReservations = res as any[];
    });
  }

  restartScanner() {
    this.message = 'Preparing scanner...';
    setTimeout(() => {
      this.startScanner();
      this.message = '';
    }, 2500);
  }

  ngOnDestroy() {
    // ✅ Clean up controls on component destroy
    if (this.controls) {
      this.controls.stop();
    }
  }
}