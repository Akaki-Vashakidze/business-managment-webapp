import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { SnackbarService } from '../../auth/services/snack-bar.service';
import { BranchesService } from '../../auth/services/branches.service';
import { BusinessService } from '../../auth/services/business.service';
import { AddBranchesComponent } from '../add-branches/add-branches.component';

export interface Branch {
  _id: string;
  name: string;
}

@Component({
  selector: 'app-my-branches',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    AddBranchesComponent
  ],
  templateUrl: './my-branches.component.html',
  styleUrl: './my-branches.component.scss'
})
export class MyBranchesComponent {

  @Input() businessId!: string; // 👈 branches belong to business

  branches: Branch[] = [];

  addItemMode = false;
  addBranchMode:boolean = false;
  updateModeOn = -1;
  branchName = '';
  updatedBranchName = '';

  constructor(
    private branchesService: BranchesService,
    private snackbarService: SnackbarService,
    private businessService: BusinessService
  ) {}

  ngOnInit() {
    this.businessService.businessSelected.subscribe(business => {
      if (business) { 
        this.businessId = business._id;
        this.getBranchesByBusiness();
      }
    });
  }

  onBranchAdded(event:any) {
    this.addBranchMode = false;
    this.getBranchesByBusiness();
  }

  getBranchesByBusiness() {
    this.branchesService.getBranchesByBusiness(this.businessId).subscribe(
      (branches: Branch[]) => {
        this.branches = branches || [];
      }
    );
  }

  openAddBranch() {
    this.addItemMode = !this.addItemMode;
    this.updateModeOn = -1;
  }

  closeModes() {
    this.addItemMode = false;
    this.updateModeOn = -1;
  }

  onUpdateModeChange(index: number) {
    this.updateModeOn = index;
    this.addItemMode = false;
  }

  addBranch() {
    this.branchesService.createBranch(this.branchName, this.businessId).subscribe({
      next: () => {
        this.branchName = '';
        this.snackbarService.success('Branch added successfully');
        this.branchesService.onBranchesUpdate();
        this.getBranchesByBusiness();
        this.closeModes();
      },
      error: (error) => console.error(error)
    });
  }

  updateBranch(branchId: string) {
    this.branchesService.updateBranch(branchId, this.updatedBranchName).subscribe({
      next: () => {
        this.snackbarService.success('Branch updated');
        this.getBranchesByBusiness();
        this.closeModes();
      },
      error: (error) => console.error(error)
    });
  }

  deleteBranch(branchId: string) {
    this.branchesService.deleteBranch(branchId).subscribe({
      next: () => {
        this.snackbarService.success('Branch deleted');
        this.branchesService.onBranchesUpdate();
        this.getBranchesByBusiness();
      },
      error: (error) => console.error(error)
    });
  }
}
