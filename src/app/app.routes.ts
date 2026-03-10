import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/platform/pages/home-page/home-page.component').then((m) => m.HomePageComponent),
  },
  {
    path: 'jobs',
    loadComponent: () =>
      import('./features/jobs/pages/jobs-browse-page/jobs-browse-page.component').then(
        (m) => m.JobsBrowsePageComponent,
      ),
  },
  {
    path: 'users/:username',
    loadComponent: () =>
      import('./features/users/pages/public-profile-page/public-profile-page.component').then(
        (m) => m.PublicProfilePageComponent,
      ),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/login-page/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/register-page/register-page.component').then((m) => m.RegisterPageComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard-page/dashboard-page.component').then(
        (m) => m.DashboardPageComponent,
      ),
  },
  {
    path: 'me',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/users/pages/my-profile-page/my-profile-page.component').then(
        (m) => m.MyProfilePageComponent,
      ),
  },
  {
    path: 'jobs/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/jobs/pages/create-job-page/create-job-page.component').then(
        (m) => m.CreateJobPageComponent,
      ),
  },
  {
    path: 'jobs/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/jobs/pages/edit-job-page/edit-job-page.component').then((m) => m.EditJobPageComponent),
  },
  {
    path: 'jobs/:id/proposals',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/jobs/pages/job-proposals-page/job-proposals-page.component').then(
        (m) => m.JobProposalsPageComponent,
      ),
  },
  {
    path: 'jobs/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/jobs/pages/job-details-page/job-details-page.component').then(
        (m) => m.JobDetailsPageComponent,
      ),
  },
  {
    path: 'my-postings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/jobs/pages/my-postings-page/my-postings-page.component').then(
        (m) => m.MyPostingsPageComponent,
      ),
  },
  {
    path: 'my-bids',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/proposals/pages/my-bids-page/my-bids-page.component').then(
        (m) => m.MyBidsPageComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
