import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon'; // Added icons
import { CommonModule } from '@angular/common';
import { BranchesService } from '../../auth/services/branches.service';
import { SnackbarService } from '../../auth/services/snack-bar.service';
import { BusinessService } from '../../auth/services/business.service';

@Component({
  selector: 'app-add-branches',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    CommonModule
  ],
  templateUrl: './add-branches.component.html',
  styleUrl: './add-branches.component.scss'
})
export class AddBranchesComponent implements OnInit {
  selectedBusinessId: string = '';
  @Output() branchAdded = new EventEmitter<void>();  

  branchForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)]
    })
  });

  constructor(
    private branchesService: BranchesService, 
    private businessService: BusinessService, 
    private snackbarService: SnackbarService
  ) {}

  ngOnInit() {
    this.businessService.businessSelected.subscribe(business => {
      if (business) { 
        this.selectedBusinessId = business._id;
      }
    });
  }

  submit() {
    if (this.branchForm.invalid) {
      this.snackbarService.error('Please provide a valid branch name');
      return;
    }

    if (!this.selectedBusinessId)  {
      this.snackbarService.error('No business selected for the branch');
      return;
    }

    const branchName = this.branchForm.getRawValue().name;

    this.branchesService.createBranch(branchName, this.selectedBusinessId).subscribe({
      next: () => {
        this.snackbarService.success('Branch created successfully');
        this.branchesService.onBranchesUpdate();
        this.branchForm.reset();
        this.branchAdded.emit();
      },
      error: (error) => {
        console.error('Error creating branch:', error);
        this.snackbarService.error('Deployment failed: Server Error');
      }
    });
  }
}