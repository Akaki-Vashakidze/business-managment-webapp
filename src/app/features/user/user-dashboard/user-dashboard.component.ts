import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { UserHeaderComponent } from '../user-header/userHeader.component';

@Component({
  selector: 'app-user-dashboard',
  imports: [CommonModule, UserHeaderComponent],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent {

}
