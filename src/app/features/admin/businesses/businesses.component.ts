import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { BusinessService } from '../../auth/services/business.service';
import { Business } from '../../../interfaces/shared-interfaces';
import { CommonModule } from '@angular/common';
import { BranchesService } from '../../auth/services/branches.service';

@Component({
  selector: 'app-businesses',
  imports: [MatMenuModule, MatButtonModule, MatIconModule, CommonModule],
  templateUrl: './businesses.component.html',
  styleUrl: './businesses.component.scss'
})
export class BusinessesComponent {
  businesses!:Business[];
  selectedBusiness:string = 'ბიზნესები'
  constructor(private businessService:BusinessService, private branchservice:BranchesService) {

    businessService.businessSelected.subscribe((business:any) => {
      this.selectedBusiness = business.name;
    })

    businessService.businessesUpdated.subscribe(item => {
      businessService.getAllMyBusinesses().subscribe((businesses:any) => {
        this.businesses = businesses;
      });
    }); 
  }

  selectBusiness(business:Business){
    localStorage.setItem('businesManagement_selectedBusiness', JSON.stringify(business));
    localStorage.removeItem('businesManagement_selectedBranch');
    this.selectedBusiness = business.name;
    this.businessService.selectBusiness(business);
    this.branchservice.onSelectedBranch(null)
  }
}
