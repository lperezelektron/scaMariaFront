import {
  Directive,
  inject,
  Input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { UserStorageService } from '../storage/user-storage.service';

@Directive({
  selector: '[hasRole]',
  standalone: true,
})
export class HasRoleDirective {
  private tpl = inject(TemplateRef<unknown>);
  private vcr = inject(ViewContainerRef);
  private userStorage = inject(UserStorageService);

  @Input('hasRole') set hasRole(role: string) {
    this.vcr.clear();
    if (this.userStorage.role() === role) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }
}
