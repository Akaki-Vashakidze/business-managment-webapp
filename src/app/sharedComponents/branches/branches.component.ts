import { Component, OnInit } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BusinessService } from '../../features/auth/services/business.service';
import { BranchesService } from '../../features/auth/services/branches.service';
import { Branch } from '../../interfaces/shared-interfaces';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [MatMenuModule, MatButtonModule, MatIconModule, CommonModule],
  templateUrl: './branches.component.html',
  styleUrl: './branches.component.scss'
})
export class BranchesComponent implements OnInit {
  branches: Branch[] = [];
  selectedBranchName: string = 'Select Branch';
  selectedBusinessId: string = '';

  constructor(
    private businessService: BusinessService, 
    private router: Router, 
    private branchService: BranchesService
  ) {}

  ngOnInit() {
    // 1. Listen for Branch selection changes
    this.branchService.selectedBranch.subscribe(branch => {
      this.selectedBranchName = branch?.name || 'Select Branch'; 
    });

    // 2. Listen for Business selection (to load relevant branches)
    this.businessService.businessSelected.subscribe(business => {
      if (business) {
        this.selectedBusinessId = business._id;
        this.getBusinessBranches();
      }
    });

    // 3. Listen for manual updates (from Add Branch component)
    this.branchService.BranchesUpdate.subscribe(() => {
      this.getBusinessBranches(); 
    });
  }   
  
  selectBranch(branch: Branch) {
    localStorage.setItem('businesManagement_selectedBranch', JSON.stringify(branch));
    this.branchService.onSelectedBranch(branch);
    this.router.navigate(['/admin/branchItems']);
  }

  getBusinessBranches() {
    if (this.selectedBusinessId) {
      this.branchService.getBranchesByBusiness(this.selectedBusinessId).subscribe((branches: any) => {
        this.branches = branches || [];
      });
    }
  }
}