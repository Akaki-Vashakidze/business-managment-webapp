import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
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
    CommonModule
  ],
  templateUrl: './add-branches.component.html',
  styleUrl: './add-branches.component.scss'
})
export class AddBranchesComponent {
  selectedBusinessId: string = '';
  @Output() branchAdded = new EventEmitter<Event>();  
  constructor(private branchesService: BranchesService, private businessService: BusinessService, private snackbarService: SnackbarService) {
    businessService.businessSelected.subscribe(business => {
      console.log('Selected business changed:', business);
      if (business) { 
        this.selectedBusinessId = business._id;
      }
    });

  }
  branchForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)]
    })
  });

  submit() {
    if (this.branchForm.invalid) {
      this.snackbarService.error('Please provide a valid branch name');
      return;
    }

    if(this.selectedBusinessId === '')  {
      this.snackbarService.error('No business selected for the branch');
      return;
    }
    const branch = this.branchForm.value;

    this.branchesService.createBranch(branch.name || '', this.selectedBusinessId).subscribe({
      next: (response) => {
        this.snackbarService.success('Branch created successfully');
        this.branchesService.onBranchesUpdate();
        this.branchAdded.emit();
      },
      error: (error) => {
        console.error('Error creating branch:', error);
      }
    });
    // 🔗 later: call API here
    // this.branchService.create(branch).subscribe(...)
    
    this.branchForm.reset();
  }
}
