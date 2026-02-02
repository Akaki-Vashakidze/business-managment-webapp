import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../auth/services/user.service';
import { SnackbarService } from '../../auth/services/snack-bar.service';
import { User } from '../../../interfaces/shared-interfaces';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { MembershipType } from '../../../enums/membership.enum';
import { Router } from '@angular/router';
import { BusinessService } from '../../auth/services/business.service';
import { BranchesService } from '../../auth/services/branches.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
  // Data
  users: User[] = [];
  searchTerm: string = '';
  userForm!: FormGroup;
  editingUser: User | null = null;
  loading: boolean = false;

  // Context
  selectedBusinessId: string = '';
  selectedBranchId: string = '';

  // Membership UI
  showCreateMembershipFeature: number = 0;
  selectedMembershipType: MembershipType = MembershipType.MONTHLY_8;
  membershipTypes = Object.values(MembershipType); 

  // Observables cleanup
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private router: Router,
    private usersService: UserService,
    private snackbarService: SnackbarService,
    private fb: FormBuilder,
    private businessService: BusinessService,
    private branchService: BranchesService
  ) {}

  ngOnInit() {
    this.initForm();
    this.initContextListeners();
    this.initSearchListener();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm() {
    this.userForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', Validators.required],
      isManager: [0],
      isOwner: [0]
    });
  }

  private initContextListeners() {
    // Listen for business changes
    this.businessService.businessSelected
      .pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe(business => {
        this.selectedBusinessId = business?._id || '';
        if (this.selectedBusinessId) this.loadUsers(this.searchTerm);
      });

    // Listen for branch changes
    this.branchService.selectedBranch
      .pipe(takeUntil(this.destroy$))
      .subscribe(branch => {
        this.selectedBranchId = branch?._id || '';
      });
  }

  private initSearchListener() {
    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((term) => {
        this.loadUsers(term);
      });
  }

  loadUsers(term: string = '') {
    if (!this.selectedBusinessId) return;

    this.loading = true;
    this.usersService.getFilteredUsers(term, this.selectedBusinessId).subscribe({
      next: (res: User[]) => {
        this.users = res;
        this.loading = false;
      },
      error: () => {
        this.snackbarService.error('Error loading users');
        this.loading = false;
      }
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
    // Scroll to form for better mobile UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  saveUser() {
    if (this.userForm.invalid) {
      this.snackbarService.error('Please fill all required fields correctly');
      return;
    }

    const userData = { ...this.userForm.value };
    const request$ = this.editingUser 
      ? this.usersService.editUser(this.editingUser._id, userData)
      : this.usersService.addUser({ ...userData, business: this.selectedBusinessId });

    request$.subscribe({
      next: () => {
        this.snackbarService.success(`User ${this.editingUser ? 'updated' : 'added'} successfully`);
        this.loadUsers(this.searchTerm);
        this.openAddUser(); // Reset form
      },
      error: (err) => this.snackbarService.error(err.error?.message || 'Action failed')
    });
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
  }

  cancelCreateMembership() {
    this.showCreateMembershipFeature = 0;
  }

  createMembership(user: User) {
    if (!this.selectedBusinessId || !this.selectedBranchId) {
      this.snackbarService.error('Please select a business and branch first');
      return;
    }

    // Ensure we send the enum value correctly
    const membershipType = typeof this.selectedMembershipType === 'string' 
      ? JSON.parse(this.selectedMembershipType) 
      : this.selectedMembershipType;

    this.usersService.createMembership(
      user._id, 
      membershipType, 
      this.selectedBusinessId, 
      this.selectedBranchId
    ).subscribe({
      next: () => {
        this.snackbarService.success('Membership created successfully');
        this.showCreateMembershipFeature = 0;
        this.loadUsers(this.searchTerm);
      },
      error: () => this.snackbarService.error('Error creating membership')
    });
  }

  launchUserDetails(userId: string) {
    this.router.navigate([`/admin/user-details/${userId}`]);
  }
}