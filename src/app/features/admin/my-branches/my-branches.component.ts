import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

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
    MatButtonModule,
    AddBranchesComponent
  ],
  templateUrl: './my-branches.component.html',
  styleUrl: './my-branches.component.scss'
})
export class MyBranchesComponent implements OnInit {

  @Input() businessId!: string; 
  branches: Branch[] = [];

  addBranchMode: boolean = false;
  updateModeOn: number = -1;
  updatedBranchName: string = '';

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

  getBranchesByBusiness() {
    if (!this.businessId) return;
    this.branchesService.getBranchesByBusiness(this.businessId).subscribe(
      (branches: Branch[]) => {
        this.branches = branches || [];
      }
    );
  }

  onBranchAdded() {
    this.addBranchMode = false;
    this.getBranchesByBusiness();
  }

  onUpdateModeChange(index: number, currentName: string) {
    this.updateModeOn = index;
    this.updatedBranchName = currentName;
  }

  closeModes() {
    this.addBranchMode = false;
    this.updateModeOn = -1;
  }

  updateBranch(branchId: string) {
    if (!this.updatedBranchName.trim()) return;
    this.branchesService.updateBranch(branchId, this.updatedBranchName).subscribe({
      next: () => {
        this.snackbarService.success('Branch identity updated');
        this.getBranchesByBusiness();
        this.closeModes();
        this.branchesService.onBranchesUpdate();
      },
      error: (error) => console.error(error)
    });
  }

  deleteBranch(branchId: string) {
    if (confirm('Are you sure? All items in this branch will be removed from view.')) {
      this.branchesService.deleteBranch(branchId).subscribe({
        next: () => {
          this.snackbarService.success('Branch decommissioned');
          this.branchesService.onBranchesUpdate();
          this.getBranchesByBusiness();
        },
        error: (error) => console.error(error)
      });
    }
  }
}