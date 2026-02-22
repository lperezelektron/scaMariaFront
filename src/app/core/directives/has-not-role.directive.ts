import { Directive, inject, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { UserStorageService } from '../storage/user-storage.service';

@Directive({
  selector: '[hasNotRole]',
  standalone: true,
})
export class HasNotRoleDirective {
  private tpl = inject(TemplateRef<unknown>);
  private vcr = inject(ViewContainerRef);
  private userStorage = inject(UserStorageService);

  @Input('hasNotRole') set hasNotRole(role: string) {
    this.vcr.clear();
    if (this.userStorage.role() !== role) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }
}
