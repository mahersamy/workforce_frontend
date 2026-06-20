import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Public routes (Auth flow)
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/components/login/login.component').then(m => m.LoginComponent),
    canActivate: [publicGuard]
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/components/register/register.component').then(m => m.RegisterComponent),
    canActivate: [publicGuard]
  },

  // Protected application routes
  {
    path: '',
    loadComponent: () => import('./core/layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'employees',
        loadComponent: () => import('./features/employees/components/employee-list/employee-list.component').then(m => m.EmployeeListComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Admin', 'Manager'] }
      },
      {
        path: 'departments',
        loadComponent: () => import('./features/departments/components/department-list/department-list.component').then(m => m.DepartmentListComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Admin', 'Manager'] }
      },
      {
        path: 'tasks',
        loadComponent: () => import('./features/tasks/components/task-list/task-list.component').then(m => m.TaskListComponent)
      },
    ]
  },

  // Wildcard fallback
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
