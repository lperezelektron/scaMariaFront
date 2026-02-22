import {
  Directive,
  inject,
  Input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { UserStorageService } from '../storage/user-storage.service';

@Directive({
  selector: '[hasNotPermission]',
  standalone: true,
})
export class HasNotPermissionDirective {
  private tpl = inject(TemplateRef<unknown>);
  private vcr = inject(ViewContainerRef);
  private userStorage = inject(UserStorageService);

  @Input('hasNotPermission') set hasNotPermission(permission: string) {
    this.vcr.clear();
    if (!this.userStorage.hasPermission(permission)) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }
}
