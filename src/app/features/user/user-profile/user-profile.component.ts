import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../auth/services/user.service';
import { User } from '../../../interfaces/shared-interfaces';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  user!: User;
  qrImageUrl: string = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    const activeUser = this.userService.getUser();
    
    if (activeUser) {
      this.user = activeUser;
    } else {
      const saved = localStorage.getItem('businesManagement_user');
      if (saved) this.user = JSON.parse(saved);
    }

    if (this.user) {
      this.generateQrCode();
    }
  }

  generateQrCode() {
    const data = encodeURIComponent(this.user.qrCode || this.user._id);
    // 250x250 for better clarity on mobile retinas
    this.qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${data}&color=3b82f6&bgcolor=ffffff&margin=10`;
  }
}