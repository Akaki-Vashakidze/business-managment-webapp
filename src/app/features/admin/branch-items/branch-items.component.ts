import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BranchItem } from '../../../interfaces/shared-interfaces';
import { SnackbarService } from '../../auth/services/snack-bar.service';
import { ItemsService } from '../../auth/services/items.service';
import { AddItemComponent } from "../add-item/add-item.component";
import { BranchesService } from '../../auth/services/branches.service';
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
  branchId!: string;
  items: BranchItem[] = [];
  itemIds: string[] = [];

  constructor(
    private itemsService: ItemsService,
    private snackbar: SnackbarService,
    private branchService: BranchesService
  ) {
    branchService.selectedBranch.subscribe(branch => {
      if (branch) {
        this.branchId = branch._id!;
      } else {
        const stored = localStorage.getItem('businesManagement_selectedBranch');
        if (stored) {
          this.branchId = JSON.parse(stored)._id;
        }
      }
      this.getItemsByBranch();
    });
  }

  getItemsByBranch() {
    this.itemsService.getItemsByBranch(this.branchId).subscribe(items => {
      this.items = items || [];
      this.itemIds = this.items.map(i => i._id);
    });
  }

  onItemAdded() {
    this.addItemMode = false;
    this.getItemsByBranch();
  }
}
