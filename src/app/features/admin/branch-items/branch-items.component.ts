import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BranchItem } from '../../../interfaces/shared-interfaces';
import { ItemsService } from '../../auth/services/items.service';
import { BranchesService } from '../../auth/services/branches.service';
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
  // ✅ This allows the parent to talk to the LiveTimes child
  @ViewChild(LiveTimesComponent) liveMonitor!: LiveTimesComponent;

  addItemMode = false;
  branchId: string = '';
  items: BranchItem[] = [];
  itemIds: string[] = [];

  constructor(
    private itemsService: ItemsService,
    private branchService: BranchesService
  ) {
    this.branchService.selectedBranch.subscribe(branch => {
      if (branch) {
        this.branchId = branch._id || '';
        this.getItemsByBranch();
      }
    });
  }

  // ✅ This method is triggered when the Reservation child emits (onReserve)
  onReservation() {
    if (this.liveMonitor) {
      this.liveMonitor.getAllReservations();
    }
  }

  getItemsByBranch() {
    if (!this.branchId) return;
    this.itemsService.getItemsByBranch(this.branchId).subscribe({
      next: (items) => {
        this.items = items || [];
        this.itemIds = this.items.map(i => i._id);
      },
      error: (err) => console.error('Failed to load items', err)
    });
  }

  onItemAdded() {
    this.addItemMode = false;
    this.getItemsByBranch();
  }
}