import { HasAnyPermissionDirective } from "src/app/core/directives/has-any-permission.directive";
import { HasPermissionDirective } from "../../core/directives/has-permission.directive";
import { HasNotPermissionDirective } from "src/app/core/directives/has-not-permission.directive";
import { HasNotRoleDirective } from "src/app/core/directives/has-not-role.directive";
import { HasRoleDirective } from "src/app/core/directives/has-role.directive";


export const SHARED_IMPORTS = [
  HasPermissionDirective,
  HasAnyPermissionDirective,
  HasNotPermissionDirective,
  HasNotRoleDirective,
  HasRoleDirective
];