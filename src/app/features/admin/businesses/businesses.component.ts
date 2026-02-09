import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { BusinessService } from '../../auth/services/business.service';
import { Business } from '../../../interfaces/shared-interfaces';
import { CommonModule } from '@angular/common';
import { BranchesService } from '../../auth/services/branches.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-businesses',
  standalone: true, // Ensure standalone is marked
  imports: [MatMenuModule, MatButtonModule, MatIconModule, CommonModule, TranslateModule],
  templateUrl: './businesses.component.html',
  styleUrl: './businesses.component.scss'
})
export class BusinessesComponent implements OnInit {
  businesses: Business[] = [];
  selectedBusiness: string = 'Businesses';

  constructor(
    private businessService: BusinessService, 
    private branchService: BranchesService
  ) {}

  ngOnInit() {
    // 1. Listen for selection changes
    this.businessService.businessSelected.subscribe((business: any) => {
      if (business) this.selectedBusiness = business.name;
    });

    // 2. Fetch businesses initially
    this.refreshBusinesses();

    // 3. Listen for updates (creation/deletion)
    this.businessService.businessesUpdated.subscribe(() => {
      this.refreshBusinesses();
    });
  }

  refreshBusinesses() {
    this.businessService.getAllMyBusinesses().subscribe((businesses: any) => {
      this.businesses = businesses || [];
    });
  }

  selectBusiness(business: Business) {
    // Standardize storage
    localStorage.setItem('businesManagement_selectedBusiness', JSON.stringify(business));
    localStorage.removeItem('businesManagement_selectedBranch');
    
    this.selectedBusiness = business.name;
    
    // Notify services
    this.businessService.selectBusiness(business);
    this.branchService.onSelectedBranch(null);
  }
}