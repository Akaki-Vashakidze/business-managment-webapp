import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../auth/services/user.service';
import { SnackbarService } from '../../auth/services/snack-bar.service';
import { User } from '../../../interfaces/shared-interfaces';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MembershipType } from '../../../enums/membership.enum';

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

  showCreateMembershipFeature: number = 0;
  selectedMembershipType: any = MembershipType.MONTHLY_8;
  membershipTypes = [MembershipType.MONTHLY_8,MembershipType.MONTHLY_12, MembershipType.MONTHLY_20, MembershipType.MONTHLY_28, MembershipType.UNLIMITED] // enum for template

  private searchSubject: Subject<string> = new Subject<string>();
  private searchSubscription!: Subscription;

  constructor(
    private usersService: UserService,
    private snackbarService: SnackbarService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.initForm();

    // Debounced search
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(300))
      .subscribe((term) => {
        this.loadUsers(term);
      });

    this.loadUsers('');
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
  }

  initForm() {
    this.userForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', Validators.required],
      isManager: [0],
      isOwner: [0]
    });
  }

  loadUsers(term: string) {
    this.usersService.getFilteredUsers(term).subscribe({
      next: (res: User[]) => this.users = res,
      error: () => this.snackbarService.error('Error loading users')
    });
  }

  onSearchChange() {
    this.searchSubject.next(this.searchTerm);
  }

  openAddUser() {
    this.editingUser = null;
    this.userForm.reset({ isManager: 0, isOwner: 0 });
  }

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

  showCreateMembership(user: User, index: number) {
    this.showCreateMembershipFeature = index + 1;
    this.selectedMembershipType = MembershipType.MONTHLY_8; // default
  }

  createMembership(user: User) {
    this.usersService.createMembership(user._id, JSON.parse(this.selectedMembershipType)).subscribe({
      next: () => {
        this.snackbarService.success('Membership created successfully');
        this.loadUsers(this.searchTerm);
        this.showCreateMembershipFeature = 0; // hide after creation
      },
      error: () => this.snackbarService.error('Error creating membership')
    });
  }
}
