import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/components/login/login.component';
import { SignupComponent } from './features/auth/components/signup/signup.component';
import { PassRecoveryComponent } from './features/auth/components/pass-recovery/pass-recovery.component';
import { ForgetPassComponent } from './features/auth/components/forget-pass/forget-pass.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';

import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { UserDashboardComponent } from './features/user/user-dashboard/user-dashboard.component';
import { AddBranchesComponent } from './features/admin/add-branches/add-branches.component';
import { AddBusinessComponent } from './features/admin/add-business/add-business.component';
import { MyBusinessesComponent } from './features/admin/my-businesses/my-businesses.component';
import { BranchItemsComponent } from './features/admin/branch-items/branch-items.component';
import { BranchesComponent } from './sharedComponents/branches/branches.component';
import { MyBranchesComponent } from './features/admin/my-branches/my-branches.component';
import { ItemManagementComponent } from './features/admin/item-management/item-management.component';
import { UsersComponent } from './features/admin/users/users.component';
import { StaffCheckInComponent } from './features/admin/staff-check-in/staff-check-in.component';
import { UserDetailsComponent } from './features/admin/user-details/user-details.component';
import { UserItemManagementComponent } from './features/user/user-item-management/user-item-management.component';

export const routes: Routes = [
  // 🔓 Public
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'password-recovery', component: PassRecoveryComponent },
  { path: 'reset-password', component: ForgetPassComponent },

  // 👤 User routes
  {
    path: 'user',
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: UserDashboardComponent },
      { path: 'reservations/:itemId', component: UserItemManagementComponent },
      { path: 'reservations/:itemId/:slotTIme', component: UserItemManagementComponent },
    ],
  },

  // 👑 Admin routes
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'branches', component: MyBranchesComponent },
      { path: 'addBusiness', component: AddBusinessComponent },
      { path: 'myBusinesses', component: MyBusinessesComponent },
      { path: 'branchItems', component: BranchItemsComponent },
      { path: 'users', component: UsersComponent },
      { path: 'item/manage/:id', component: ItemManagementComponent },
      { path: 'checkIn', component: StaffCheckInComponent },
      { path: 'user-details/:userId', component: UserDetailsComponent },
    ],
  },

  // fallback
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
