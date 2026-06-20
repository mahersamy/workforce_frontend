import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthFacadeService } from '../../../features/auth/services/auth-facade.service';
import { CommonModule } from '@angular/common';
import { HasRoleDirective } from '../../../shared/directives/has-role.directive';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    HasRoleDirective
  ],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent {

  private readonly authFacade = inject(AuthFacadeService);

  isSidebarActive = signal(false);
  currentUser = this.authFacade.currentUser;


  toggleSidebar(): void {
    this.isSidebarActive.update(active => !active);
  }

  closeSidebar(): void {
    this.isSidebarActive.set(false);
  }

  logout(): void {
    this.authFacade.logout();
  }
}
