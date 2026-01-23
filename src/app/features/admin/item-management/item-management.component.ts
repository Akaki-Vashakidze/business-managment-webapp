import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { User } from '../../../interfaces/shared-interfaces';
import { UserService } from '../../auth/services/user.service';
import { ItemManagementService } from '../../auth/services/itemManagement.service';
import { SnackbarService } from '../../auth/services/snack-bar.service';

@Component({
  selector: 'app-item-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './item-management.component.html',
  styleUrl: './item-management.component.scss'
})
export class ItemManagementComponent implements OnInit {

  item!: string;
  users: User[] = [];

  reservation = {
    user: '',
    date: '',
    startHour: 9,
    startMinute: 0,
    endHour: 10,
    endMinute: 0,
    isPaid: false
  };

  // ✅ New: checkbox state
  dateOption: 'today' | 'tomorrow' | 'dayAfter' | '' = '';

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private itemManagementService: ItemManagementService,
    private snackbar: SnackbarService
  ) {}

  ngOnInit(): void {
    this.item = this.route.snapshot.paramMap.get('id')!;
    this.getAllUsers();
  }

  getAllUsers() {
    this.userService.getAllUsers().subscribe((users: User[]) => {
      this.users = users;
    });
  }

  // ✅ New: handle checkbox selection
  selectDate(option: 'today' | 'tomorrow' | 'dayAfter') {
    this.dateOption = option;

    const today = new Date();
    let selectedDate = new Date();

    if(option === 'tomorrow') selectedDate.setDate(today.getDate() + 1);
    else if(option === 'dayAfter') selectedDate.setDate(today.getDate() + 2);

    // Format date as YYYY-MM-DD for the input
    this.reservation.date = selectedDate.toISOString().split('T')[0];
  }

  reserveItem() {
    if (!this.reservation.user || !this.reservation.date) {
      this.snackbar.error('Please fill all fields');
      return;
    }

    const start = this.reservation.startHour * 60 + this.reservation.startMinute;
    const end = this.reservation.endHour * 60 + this.reservation.endMinute;

    if (start >= end) {
      this.snackbar.error('End time must be after start time');
      return;
    }

    const payload = {
      item: this.item,
      user: this.reservation.user,
      date: this.reservation.date,
      startHour: this.reservation.startHour,
      startMinute: this.reservation.startMinute,
      endHour: this.reservation.endHour,
      endMinute: this.reservation.endMinute,
      isPaid: this.reservation.isPaid ? 1 : 0
    };  

    this.itemManagementService.reserveitem(payload).subscribe({
      next: (res) => {
        if(res.success) {
          this.snackbar.success('Item reserved successfully');
        } else {
          this.snackbar.error(res.message || 'Reservation failed');
        }
      }, 
      error: (err) => {
        this.snackbar.error(err.error?.message || 'Reservation failed');
      }
    });
  }
}

