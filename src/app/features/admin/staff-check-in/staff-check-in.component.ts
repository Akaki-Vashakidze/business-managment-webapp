import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { MembershipService } from '../../auth/services/membership.service';
import { CommonModule } from '@angular/common';
import { SnackbarService } from '../../auth/services/snack-bar.service';
import { BusinessService } from '../../auth/services/business.service';
import { BranchesService } from '../../auth/services/branches.service';
import { ItemsService } from '../../auth/services/items.service';
import { ItemManagementService } from '../../auth/services/itemManagement.service';
import { ItemManagement, User } from '../../../interfaces/shared-interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-staff-check-in',
  templateUrl: './staff-check-in.component.html',
  imports: [CommonModule],
  styleUrl: './staff-check-in.component.scss'
})
export class StaffCheckInComponent implements OnInit, OnDestroy {

  @ViewChild('video', { static: true })
  video!: ElementRef<HTMLVideoElement>;

  private codeReader = new BrowserMultiFormatReader();
  scanning = false;
  message = '';
  items: any;
  itemManagementData!: ItemManagement;
  itemsIds!: string[];
  allReservations: any;
  selectedBusinessId!: string;
  selectedBranchId!: string;
  constructor(private membershipService: MembershipService, private router: Router, private snackbar: SnackbarService, private itemManagementService: ItemManagementService, private itemsService: ItemsService, private snackbarService: SnackbarService, private businessService: BusinessService, private branchService: BranchesService) {
    businessService.businessSelected.subscribe(business => {
      this.selectedBusinessId = business?._id || ''
    })

    branchService.selectedBranch.subscribe(branch => {
      this.selectedBranchId = branch?._id || ''
      this.getItemsByBranch();
    })

  }

  async ngOnInit() {
    await this.startScanner();
  }

  async startScanner() {
    this.scanning = true; // ✅ REQUIRED

    const devices = await BrowserMultiFormatReader.listVideoInputDevices();
    const deviceId = devices[0]?.deviceId;

    await this.codeReader.decodeFromVideoDevice(
      deviceId,
      this.video.nativeElement,
      (result) => {
        if (result && this.scanning) {
          this.scanning = false;
          this.handleScan(result.getText());
        }
      }
    );
  }

  handleScan(qr: string) {
    const staffId = 'currentStaffUserId';
    const businessId = 'currentStaffBusinessId';
    const branchId = 'currentStaffBranchId';
    let user;
    this.checkReservationData(qr)
    this.membershipService.checkIn(qr, this.selectedBusinessId, this.selectedBranchId, this.itemManagementData).subscribe(res => {
      if (res.success) {
        this.message = `✅ Check-in successful. Remaining visits: ${res.remainingVisits}`;
        this.snackbarService.success('Checked In')
        this.restartScanner();
        this.router.navigate(['/admin/branchItems'])
      } else {
        this.message = `❌ ${res.errors || 'Check-in failed'}`;
        this.snackbarService.error(res.errors)
        this.restartScanner();
      }
    });
  }

  getItemsByBranch() {
    this.itemsService.getItemsByBranch(this.selectedBranchId).subscribe(items => {
      this.items = items || [];
      this.itemsIds = this.items.map((i: any) => i._id);
      this.loadReservations(this.itemsIds)
    });
  }

  restartScanner() {
    setTimeout(() => {
      this.scanning = true;
      this.message = '';
    }, 2000);
  }

  loadReservations(ids: string[]) {
    this.itemManagementService.getAllItemsReservations(ids).subscribe(res => {
      this.allReservations = res;
    });
  }

  checkReservationData(userId: string) {
    // ⏱️ now
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const todaysDate = now.toISOString().split('T')[0];

    // convert time to minutes for comparison
    const startMinutes = now.getHours() * 60 + now.getMinutes();
    const endMinutes =
      oneHourLater.getHours() * 60 + oneHourLater.getMinutes();
    const freeItem = this.itemsIds.find(itemId => {
      return !this.allReservations.some((r: any) => {
        const rDate = new Date(r.date).toISOString().split('T')[0];
        if (r.item._id !== itemId || rDate !== todaysDate) return false;
        
        const rStart = r.startHour * 60 + r.startMinute;
        const rEnd = r.endHour * 60 + r.endMinute;

        // ⛔ overlap check
        return startMinutes < rEnd && endMinutes > rStart;
      });
    });

    if (!freeItem) {
      this.snackbar.error('No item is free for this time range');
      return;
    }

    this.itemManagementData = {
      item: freeItem,
      user: userId,
      date: todaysDate.toString(),
      startHour: now.getHours(),
      startMinute: now.getMinutes(),
      endHour: oneHourLater.getHours(),
      endMinute: oneHourLater.getMinutes(),
      isPaid: 1
    };

  }


  ngOnDestroy() {
    const video = this.video?.nativeElement;
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
  }
}
