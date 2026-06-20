import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { AuthFacadeService } from '../../features/auth/services/auth-facade.service';

/**
 * Structural directive to conditionally display content based on the user's role.
 * Works reactively with Angular Signals.
 *
 * @example
 * <div *appHasRole="['Admin', 'Manager']">Visible to Admin and Manager</div>
 * <div *appHasRole="'Admin'">Visible to Admin only</div>
 */
@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective {
  private readonly templateRef = inject(TemplateRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authFacade = inject(AuthFacadeService);

  // Modern Angular signal-based input
  appHasRole = input.required<string | string[]>();

  constructor() {
    effect(() => {
      const allowedRoles = this.appHasRole();
      const currentUser = this.authFacade.currentUser();

      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      const hasAccess = currentUser && roles.includes(currentUser.role);

      this.viewContainer.clear();
      if (hasAccess) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }
}
