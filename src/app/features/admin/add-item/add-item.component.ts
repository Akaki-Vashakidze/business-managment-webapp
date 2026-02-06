import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon'; // <--- ADDED
import { ItemsService } from '../../auth/services/items.service';
import { SnackbarService } from '../../auth/services/snack-bar.service';
import { BranchesService } from '../../auth/services/branches.service';

@Component({
  selector: 'app-add-item',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule, // <--- ADDED
    CommonModule
  ],
  templateUrl: './add-item.component.html',
  styleUrl: './add-item.component.scss'
})
export class AddItemComponent implements OnInit {
  branchId: string = '';
  @Output() itemAdded = new EventEmitter<void>();

  itemForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)]
    })
  });

  constructor(
    private itemsService: ItemsService,
    private snackbarService: SnackbarService,
    private branchService: BranchesService
  ) {}

  ngOnInit() {
    this.branchService.selectedBranch.subscribe(branch => {
      if (branch) {
        this.branchId = branch._id || '';
      }
    });
  }

  submit() {
    // Fallback to localStorage if branchId is missing
    if(!this.branchId)  {
      const stored = localStorage.getItem('businesManagement_selectedBranch');
      this.branchId = stored ? JSON.parse(stored)._id : '';
    }

    if(!this.branchId)  {
      this.snackbarService.error('No branch selected for the item');
      return;
    }

    if (this.itemForm.invalid) return;

    this.itemsService.createItem(this.itemForm.getRawValue().name, this.branchId).subscribe({
      next: () => {
        this.snackbarService.success('Item created successfully');
        this.itemsService.notifyItemsUpdated();
        this.itemForm.reset();
        this.itemAdded.emit();
      },
      error: () => this.snackbarService.error('Failed to create item')
    });
  }
}