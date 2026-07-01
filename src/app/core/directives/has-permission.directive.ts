import {
  Directive,
  inject,
  Input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { UserStorageService } from '../storage/user-storage.service';

@Directive({
  selector: '[hasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private tpl = inject(TemplateRef<unknown>);
  private vcr = inject(ViewContainerRef);
  private userStorage = inject(UserStorageService);

  @Input('hasPermission') set hasPermission(value: string | string[]) {
    const required = Array.isArray(value) ? value : [value];
    const ok = required.length === 0 ? true : this.userStorage.hasAny(required);

    this.vcr.clear();
    if (ok) this.vcr.createEmbeddedView(this.tpl);
  }
}
