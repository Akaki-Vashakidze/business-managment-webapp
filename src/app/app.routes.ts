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
    ],
  },

  // 👑 Admin routes
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'addBranches', component: AddBranchesComponent },
    ],
  },

  // fallback
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
