import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BranchItemsComponent } from "../branch-items/branch-items.component";

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, BranchItemsComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {

}
