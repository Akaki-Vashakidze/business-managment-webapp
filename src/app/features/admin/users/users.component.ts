import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../auth/services/user.service';
import { SnackbarService } from '../../auth/services/snack-bar.service';
import { User } from '../../../interfaces/shared-interfaces';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
  users: User[] = [];
  searchTerm: string = '';
  userForm!: FormGroup;
  editingUser: User | null = null;

  private searchSubject: Subject<string> = new Subject<string>();
  private searchSubscription!: Subscription;

  constructor(
    private usersService: UserService,
    private snackbarService: SnackbarService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.initForm();

    // Subscribe to debounced search
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(300)) // wait 0.3 seconds
      .subscribe((term) => {
        this.loadUsers(term);
      });

    // Initial load
    this.loadUsers('');
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
  }

  // Initialize Add/Edit form
  initForm() {
    this.userForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', Validators.required],
      isManager: [0],
      isOwner: [0]
    });
  }

  // Load users from backend
  loadUsers(term: string) {
    this.usersService.getFilteredUsers(term).subscribe({
      next: (res: User[]) => {
        this.users = res;
      },
      error: () => this.snackbarService.error('Error loading users')
    });
  }

  // Trigger search whenever user types
  onSearchChange() {
    this.searchSubject.next(this.searchTerm);
  }

  // Open Add User form
  openAddUser() {
    this.editingUser = null;
    this.userForm.reset({ isManager: 0, isOwner: 0 });
  }

  // Open Edit User form
  openEditUser(user: User) {
    this.editingUser = user;
    this.userForm.patchValue({
      fullName: user.fullName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      isManager: user.isManager,
      isOwner: user.isOwner
    });
  }

  // Save Add/Edit user
  saveUser() {
    if (this.userForm.invalid) return;

    const userData = this.userForm.value;

    if (this.editingUser) {
      this.usersService.editUser(this.editingUser._id, userData).subscribe({
        next: () => {
          this.snackbarService.success('User updated successfully');
          this.loadUsers(this.searchTerm);
        },
        error: () => this.snackbarService.error('Error updating user')
      });
    } else {
      this.usersService.addUser(userData).subscribe({
        next: () => {
          this.snackbarService.success('User added successfully');
          this.loadUsers(this.searchTerm);
        },
        error: () => this.snackbarService.error('Error adding user')
      });
    }

    this.userForm.reset({ isManager: 0, isOwner: 0 });
    this.editingUser = null;
  }

  // Delete user
  deleteUser(user: User) {
    if (!confirm(`Are you sure you want to delete ${user.fullName}?`)) return;

    this.usersService.deleteUser(user._id).subscribe({
      next: () => {
        this.snackbarService.success('User deleted successfully');
        this.loadUsers(this.searchTerm);
      },
      error: () => this.snackbarService.error('Error deleting user')
    });
  }

  // Create membership
  createMembership(user: User) {
    this.usersService.createMembership(user._id).subscribe({
      next: () => {
        this.snackbarService.success('Membership created successfully');
        this.loadUsers(this.searchTerm);
      },
      error: () => this.snackbarService.error('Error creating membership')
    });
  }
}
