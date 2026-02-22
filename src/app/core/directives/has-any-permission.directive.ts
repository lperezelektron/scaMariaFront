import {
  Directive,
  inject,
  Input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { UserStorageService } from '../storage/user-storage.service';

@Directive({
  selector: '[hasAnyPermission]',
  standalone: true,
})
export class HasAnyPermissionDirective {
  private tpl = inject(TemplateRef<unknown>);
  private vcr = inject(ViewContainerRef);
  private userStorage = inject(UserStorageService);

  @Input('hasAnyPermission') set hasAnyPermission(permissions: string[]) {
    this.vcr.clear();
    if (this.userStorage.hasAny(permissions)) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }
}
