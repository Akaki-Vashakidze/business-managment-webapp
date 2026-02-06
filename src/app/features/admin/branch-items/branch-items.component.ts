import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BranchItem } from '../../../interfaces/shared-interfaces';
import { ItemsService } from '../../auth/services/items.service';
import { BranchesService } from '../../auth/services/branches.service';

// Child Components
import { AddItemComponent } from "../add-item/add-item.component";
import { ItemsWholeReservesComponent } from "../items-whole-reserves/items-all-reservations.component";
import { LiveTimesComponent } from "../../../live-times/live-times.component";

@Component({
  selector: 'app-branch-items',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    AddItemComponent,
    ItemsWholeReservesComponent,
    LiveTimesComponent
  ],
  templateUrl: './branch-items.component.html',
  styleUrl: './branch-items.component.scss'
})
export class BranchItemsComponent {

  addItemMode = false;
  branchId: string = '';
  items: BranchItem[] = [];
  itemIds: string[] = [];

  constructor(
    private itemsService: ItemsService,
    private branchService: BranchesService
  ) {
    // Listen for branch changes and fetch items automatically
    this.branchService.selectedBranch.subscribe(branch => {
      if (branch) {
        this.branchId = branch._id || '';
        this.getItemsByBranch();
      }
    });
  }

  getItemsByBranch() {
    if (!this.branchId) return;
    
    this.itemsService.getItemsByBranch(this.branchId).subscribe({
      next: (items) => {
        this.items = items || [];
        // Update itemIds so the global reservations component refreshes
        this.itemIds = this.items.map(i => i._id);
      },
      error: (err) => console.error('Failed to load items', err)
    });
  }

  onItemAdded() {
    this.addItemMode = false; // Hide form after success
    this.getItemsByBranch(); // Refresh list
  }
}