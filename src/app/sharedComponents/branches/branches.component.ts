import { Component } from '@angular/core';
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
export class BranchesComponent {
  branches: Branch[] = [];
  selectedBranch: string = 'ფილიალები';
  selectedBusinessId: string = '';
  constructor(private businessService:BusinessService, private router:Router, private branchservice:BranchesService) {
    branchservice.selectedBranch.subscribe(branch => {
      this.selectedBranch = branch?.name || 'ფილიალები'; 
    })

    businessService.businessSelected.subscribe(item => {
      this.selectedBusinessId = item?._id || '';
      this.getBusinessBranches()
    });

    branchservice.BranchesUpdate.subscribe(item => {
      this.getBusinessBranches(); 
    })
  }   
  
  selectBranch(branch:Branch){
    localStorage.setItem('businesManagement_selectedBranch', JSON.stringify(branch));
    this.selectedBranch = branch.name;
    this.router.navigate(['/admin/branchItems']);
    this.branchservice.onSelectedBranch(branch);
  }

  getBusinessBranches(){
    if(this.selectedBusinessId){
      this.branchservice.getBranchesByBusiness(this.selectedBusinessId).subscribe((branches:any) => {
        this.branches = branches;
      });
    }
  }
} 
    
