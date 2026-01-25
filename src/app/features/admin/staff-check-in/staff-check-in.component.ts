import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { MembershipService } from '../../auth/services/membership.service';
import { CommonModule } from '@angular/common';
import { SnackbarService } from '../../auth/services/snack-bar.service';
import { BusinessService } from '../../auth/services/business.service';
import { BranchesService } from '../../auth/services/branches.service';

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
  selectedBusinessId!: string;
  selectedBranchId!: string;
  constructor(private membershipService: MembershipService, private snackbarService: SnackbarService, private businessService: BusinessService, private branchService: BranchesService) {
    businessService.businessSelected.subscribe(business => {
      this.selectedBusinessId = business?._id || ''
    })

    branchService.selectedBranch.subscribe(branch => {
      this.selectedBranchId = branch?._id || ''
    })

  }

  async ngOnInit() {
    await this.startScanner();
  }

  // async startScanner() {
  //   this.scanning = true;

  //   await this.codeReader.decodeFromVideoDevice(
  //     undefined,
  //     this.video.nativeElement,
  //     (result, error) => {
  //       if (result && this.scanning) {
  //         this.scanning = false;
  //         const qr = result.getText();
  //         this.handleScan(qr);
  //       }
  //     }
  //   );
  // }

  //safer scanner
  //   async startScanner() {
  //   const devices = await BrowserMultiFormatReader.listVideoInputDevices();
  //   const deviceId = devices[0]?.deviceId;

  //   await this.codeReader.decodeFromVideoDevice(
  //     deviceId,
  //     this.video.nativeElement,
  //     (result) => {
  //       if (result && this.scanning) {
  //         this.scanning = false;
  //         this.handleScan(result.getText());
  //       }
  //     }
  //   );
  // }

  //this scans, so coooool
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

  // {
  //       next: (res) => {
  //         this.message = `✅ Check-in successful. Remaining visits: ${res.remainingVisits}`;
  //         this.restartScanner();
  //       },
  //       error: (err) => {
  //         this.message = `❌ ${err.error?.message || 'Check-in failed'}`;
  //         this.restartScanner();
  //       }
  //     }

  handleScan(qr: string) {
    const staffId = 'currentStaffUserId';
    const businessId = 'currentStaffBusinessId';
    const branchId = 'currentStaffBranchId'; // optional
    // {
    //     next: (res: any) => {
    //       this.message = `✅ Check-in successful. Remaining visits: ${res.remainingVisits}`;
    //       this.restartScanner();
    //     },  
    //     error: (err) => {
    //       this.message = `❌ ${err.error?.message || 'Check-in failed'}`;
    //       this.restartScanner();
    //     }
    //   }
    this.membershipService.checkIn(qr, this.selectedBusinessId, this.selectedBranchId).subscribe(res => {
      if (res.statusCode != 400) {
        this.message = `✅ Check-in successful. Remaining visits: ${res.remainingVisits}`;
        this.snackbarService.success('Checked In')
        this.restartScanner();
      } else {
        this.message = `❌ ${res.errors || 'Check-in failed'}`;
        this.snackbarService.error(res.errors)
        this.restartScanner();
      }
    });
  }

  restartScanner() {
    setTimeout(() => {
      this.scanning = true;
      this.message = '';
    }, 2000);
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
