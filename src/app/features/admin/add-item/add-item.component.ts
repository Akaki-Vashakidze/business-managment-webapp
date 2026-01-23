import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { ItemsService } from '../../auth/services/items.service';
import { SnackbarService } from '../../auth/services/snack-bar.service';
import { Branch } from '../my-branches/my-branches.component';
import { BranchesService } from '../../auth/services/branches.service';

@Component({
  selector: 'app-add-item',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    CommonModule
  ],
  templateUrl: './add-item.component.html',
  styleUrl: './add-item.component.scss'
})
export class AddItemComponent {
  branchId!: string;
  @Output() itemAdded = new EventEmitter<void>();

  constructor(
    private itemsService: ItemsService,
    private snackbarService: SnackbarService,
    private branchService: BranchesService
  ) {
    branchService.selectedBranch.subscribe(branch => {
      if (branch) {
        this.branchId = branch._id || '';
      }
    });
  }

  itemForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)]
    })
  });

  submit() {
    if(this.branchId === '' || !this.branchId)  {
      this.branchId = localStorage.getItem('businesManagement_selectedBranch') ? JSON.parse(localStorage.getItem('businesManagement_selectedBranch') || '')._id : '';
    }

    if(this.branchId === '')  {
      this.snackbarService.error('No branch selected for the item');
      return;
    }

    if (this.itemForm.invalid) return;

    alert('2')
    const item = this.itemForm.value;

    this.itemsService.createItem(item.name || '', this.branchId).subscribe({
      next: () => {
        this.snackbarService.success('Item created successfully');
        this.itemsService.notifyItemsUpdated();
        this.itemForm.reset();
        this.itemAdded.emit();
      },
      error: (error) => {
        console.error('Error creating item:', error);
        this.snackbarService.error('Failed to create item');
      }
    });
  }
}
