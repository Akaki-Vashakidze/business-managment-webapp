import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { IsAlreadyAuthedGuard } from './guards/isAlreadyAuthed.guard';

export const routes: Routes = [
  // 🔓 Public (Load immediately or lazy load)
  { 
    path: 'login', 
    canActivate: [IsAlreadyAuthedGuard], 
    loadComponent: () => import('./features/auth/components/login/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'signup', 
    loadComponent: () => import('./features/auth/components/signup/signup.component').then(m => m.SignupComponent) 
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./sharedComponents/dashboard/dashboard.component').then(m => m.DashboardComponent) 
  },
  { 
    path: 'password-recovery', 
    loadComponent: () => import('./features/auth/components/pass-recovery/pass-recovery.component').then(m => m.PassRecoveryComponent) 
  },
  { 
    path: 'newpass/:token', 
    loadComponent: () => import('./features/auth/components/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) 
  },

  // 👤 User routes (Lazy Loaded)
  {
    path: 'user',
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/user/user-dashboard/user-dashboard.component').then(m => m.UserDashboardComponent) },
      { path: 'profile', loadComponent: () => import('./features/user/user-profile/user-profile.component').then(m => m.UserProfileComponent) },
      { path: 'reservations/:itemId', loadComponent: () => import('./features/user/user-item-management/user-item-management.component').then(m => m.UserItemManagementComponent) },
      { path: 'reservations/:itemId/:slotTIme', loadComponent: () => import('./features/user/user-item-management/user-item-management.component').then(m => m.UserItemManagementComponent) },
    ],
  },

  // 👑 Admin routes (Lazy Loaded - Biggest size savings here!)
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'branches', loadComponent: () => import('./features/admin/my-branches/my-branches.component').then(m => m.MyBranchesComponent) },
      { path: 'addBusiness', loadComponent: () => import('./features/admin/add-business/add-business.component').then(m => m.AddBusinessComponent) },
      { path: 'myBusinesses', loadComponent: () => import('./features/admin/my-businesses/my-businesses.component').then(m => m.MyBusinessesComponent) },
      { path: 'branchItems', loadComponent: () => import('./features/admin/branch-items/branch-items.component').then(m => m.BranchItemsComponent) },
      { path: 'users', loadComponent: () => import('./features/admin/users/users.component').then(m => m.UsersComponent) },
      { path: 'item/manage/:id', loadComponent: () => import('./features/admin/item-management/item-management.component').then(m => m.ItemManagementComponent) },
      { path: 'checkIn', loadComponent: () => import('./features/admin/staff-check-in/staff-check-in.component').then(m => m.StaffCheckInComponent) },
      { path: 'user-details/:userId', loadComponent: () => import('./features/admin/user-details/user-details.component').then(m => m.UserDetailsComponent) },
      { path: 'analytics', loadComponent: () => import('./features/admin/analytics/analytics.component').then(m => m.AnalyticsComponent) },
    ],
  },

  // fallback
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];