import { Component } from '@angular/core';
import { BusinessService } from '../../auth/services/business.service';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { Business } from '../../../interfaces/shared-interfaces';
import { FormsModule } from '@angular/forms';
import { SnackbarService } from '../../auth/services/snack-bar.service';
import { MatIconModule } from "@angular/material/icon";
import { BranchesService } from '../../auth/services/branches.service';
import { AddBusinessComponent } from '../add-business/add-business.component';

@Component({
  selector: 'app-my-businesses',
  imports: [MatCardModule, CommonModule, FormsModule, MatIconModule, AddBusinessComponent],
  templateUrl: './my-businesses.component.html',
  styleUrl: './my-businesses.component.scss'
})
export class MyBusinessesComponent {
  myBusinesses: Business[] = [];
  addBranchMode: number = -1;
  branchName:string = '';
  addBusinessMode: boolean = false;
  businessUpdatedName:string = '';
  updateModeOn:number = -1;
  constructor(private businessService: BusinessService, private branchService:BranchesService,private snackbarService:SnackbarService) {
    this.getAllMyBusinesses();
  }

  getAllMyBusinesses() {
    this.businessService.getAllMyBusinesses().subscribe((businesses: Business[]) => {
      this.myBusinesses = businesses || [];
    });
  } 

  onBusinessAdded(event:Event){
    this.addBusinessMode = false;
    this.getAllMyBusinesses();
  }

  addBranchModeOn(index:number){
    this.addBranchMode = index;
    this.updateModeOn = -1;
  }

  closeModes(){
    this.addBranchMode = -1;
    this.updateModeOn = -1;
  }

  addBranchToBusiness(businessId: string) {
    console.log('Add branch to business with ID:', businessId);
    this.addBranchMode = -1;
    this.branchService.createBranch(this.branchName, businessId).subscribe({
      next: (response) => {
        console.log('Branch added successfully:', response);
        this.branchName = '';
        this.snackbarService.success('Branch added successfully');
        this.branchService.onBranchesUpdate();
      },
      error: (error) => {
        console.error('Error adding branch:', error);
      }
    });
  }

  onUpdateModeChange(index:number){
    this.updateModeOn = index;
    this.addBranchMode = -1;
  }

  updateBusiness(businessId: string, name: string = 'Updated Business Name') {
    console.log('Edit business with ID:', businessId);
    this.businessService.updateBusiness(businessId, name).subscribe({
      next: (response) => {
        console.log('Business updated successfully:', response);
        this.getAllMyBusinesses();
        this.snackbarService.success('Business updated successfully');
      },
      error: (error) => {
        console.error('Error updating business:', error);
      }
    });
  }
  
  deletebusiness(businessId: string) {
    console.log('Delete business with ID:', businessId);    
    this.businessService.deletebusiness(businessId).subscribe({
      next: (response) => {
        console.log('Business deleted successfully:', response);
        this.snackbarService.success('Business deleted successfully');
        this.businessService.onBusinessesUpdated();
        this.getAllMyBusinesses()
      },
      error: (error) => {
        console.error('Error deleting business:', error);
      }
    });
  }
}
