import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

// Services & Components
import { BusinessService } from '../../auth/services/business.service';
import { BranchesService } from '../../auth/services/branches.service';
import { SnackbarService } from '../../auth/services/snack-bar.service';
import { Business } from '../../../interfaces/shared-interfaces';
import { AddBusinessComponent } from '../add-business/add-business.component';

@Component({
  selector: 'app-my-businesses',
  standalone: true,
  imports: [
    MatCardModule, 
    CommonModule, 
    FormsModule, 
    MatIconModule, 
    MatButtonModule,
    AddBusinessComponent
  ],
  templateUrl: './my-businesses.component.html',
  styleUrl: './my-businesses.component.scss'
})
export class MyBusinessesComponent implements OnInit {
  myBusinesses: Business[] = [];
  addBranchMode: number = -1;
  branchName: string = '';
  addBusinessMode: boolean = false;
  businessUpdatedName: string = '';
  updateModeOn: number = -1;

  constructor(
    private businessService: BusinessService, 
    private branchService: BranchesService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit() {
    this.getAllMyBusinesses();
  }

  getAllMyBusinesses() {
    this.businessService.getAllMyBusinesses().subscribe((businesses: Business[]) => {
      this.myBusinesses = businesses || [];
    });
  }

  onBusinessAdded(event: any) {
    this.addBusinessMode = false;
    this.getAllMyBusinesses();
  }

  addBranchModeOn(index: number) {
    this.addBranchMode = index;
    this.updateModeOn = -1;
    this.branchName = '';
  }

  onUpdateModeChange(index: number) {
    this.updateModeOn = index;
    this.addBranchMode = -1;
    this.businessUpdatedName = this.myBusinesses[index - 1].name;
  }

  closeModes() {
    this.addBranchMode = -1;
    this.updateModeOn = -1;
  }

  addBranchToBusiness(businessId: string) {
    if (!this.branchName.trim()) return;
    this.branchService.createBranch(this.branchName, businessId).subscribe({
      next: () => {
        this.snackbarService.success('Branch added successfully');
        this.branchName = '';
        this.closeModes();
        this.branchService.onBranchesUpdate();
      }
    });
  }

  updateBusiness(businessId: string, name: string) {
    if (!name.trim()) return;
    this.businessService.updateBusiness(businessId, name).subscribe({
      next: () => {
        this.snackbarService.success('Business renamed');
        this.getAllMyBusinesses();
        this.closeModes();
        this.businessService.onBusinessesUpdated();
      }
    });
  }

  deletebusiness(businessId: string) {
    if (confirm('Are you sure? This will delete all branches associated with this business.')) {
      this.businessService.deletebusiness(businessId).subscribe({
        next: () => {
          this.snackbarService.success('Business deleted');
          this.businessService.onBusinessesUpdated();
          this.getAllMyBusinesses();
        }
      });
    }
  }
}