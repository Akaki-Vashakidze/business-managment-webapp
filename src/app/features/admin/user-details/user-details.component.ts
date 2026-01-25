import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../auth/services/user.service';
import { SnackbarService } from '../../auth/services/snack-bar.service';
import { User } from '../../../interfaces/shared-interfaces';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss'
})
export class UserDetailsComponent implements OnInit {

  userId!: string;
  user!: User;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    // Get userId from route
    this.userId = this.route.snapshot.paramMap.get('userId') as string;

    if (!this.userId) {
      this.snackbarService.error('User ID not found');
      return;
    }

    this.getUser();
  }

  getUser() {
    this.userService.getUserById(this.userId).subscribe(res => {
      if(res.statusCode == 200) {
        this.user = res.result.data
      } else {
        this.snackbarService.error('Can not find user')
      }
    });
  }
}
