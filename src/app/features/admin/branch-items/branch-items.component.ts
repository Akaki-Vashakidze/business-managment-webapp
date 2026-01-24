
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BranchItem } from '../../../interfaces/shared-interfaces';
import { SnackbarService } from '../../auth/services/snack-bar.service';
import { ItemsService } from '../../auth/services/items.service';
import { AddItemComponent } from "../add-item/add-item.component";
import { BranchesService } from '../../auth/services/branches.service';
import { Router } from "@angular/router";
import { ItemsWholeReservesComponent } from "../items-whole-reserves/items-all-reservations.component";

@Component({
  selector: 'app-branch-items',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    AddItemComponent,
    AddItemComponent,
    ItemsWholeReservesComponent
  ],
  templateUrl: './branch-items.component.html',
  styleUrl: './branch-items.component.scss'
})
export class BranchItemsComponent {
  addItemMode: boolean = false;
  branchId!: string;
  items: BranchItem[] = [];

  updateModeOn = -1;

  itemName = '';
  updatedItemName = '';
  itemIds: string[] = []
  constructor(
    private itemsService: ItemsService,
    private snackbar: SnackbarService,
    private branchService: BranchesService,
    private router: Router
  ) {
    branchService.selectedBranch.subscribe(branch => {
      if (branch) {
        this.branchId = branch._id || '';
      } else {
        const selectedBranch = localStorage.getItem('businesManagement_selectedBranch');
        if (selectedBranch) {
          this.branchId = JSON.parse(selectedBranch)._id || '';
        }
      }
      this.getItemsByBranch();
    });
  }

  getItemsByBranch() {
    this.itemsService.getItemsByBranch(this.branchId).subscribe((items => {
      this.items = items || [];
      this.itemIds = this.items.map(item => item._id);
    }));
  }

  onItemAdded(event: any) {
    this.addItemMode = false;
    this.getItemsByBranch();
  }

  closeModes() {
    this.updateModeOn = -1;
  }

  addItem() {
    this.itemsService.createItem(this.itemName, this.branchId).subscribe({
      next: () => {
        this.itemName = '';
        this.getItemsByBranch();
        this.snackbar.success('Item added successfully');
        this.closeModes();
      },
      error: () => {
        this.snackbar.error('Failed to add item');
      }
    });
  }

  onUpdateModeChange(index: number) {
    this.updateModeOn = index;
  }

  updateItem(itemId: string) {
    this.itemsService.updateItem(itemId, this.updatedItemName).subscribe({
      next: () => {
        this.getItemsByBranch();
        this.snackbar.success('Item updated successfully');
        this.closeModes();
      },
      error: () => {
        this.snackbar.error('Failed to update item');
      }
    });
  }

  onManageItemTime(item: BranchItem) {
    this.router.navigate(['/admin/item/manage', item._id]);
  }

  deleteItem(itemId: string) {
    this.itemsService.deleteItem(itemId).subscribe({
      next: () => {
        this.getItemsByBranch();
        this.snackbar.success('Item deleted');
      },
      error: () => {
        this.snackbar.error('Failed to delete item');
      }
    });
  }
}

