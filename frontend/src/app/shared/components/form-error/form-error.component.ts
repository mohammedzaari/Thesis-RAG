import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Displays a validation message below a form field (accessible alert). */
@Component({
  selector: 'app-form-error',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@if (visible()) { <p class="error" role="alert"><ng-content /></p> }`,
})
export class FormErrorComponent {
  readonly visible = input.required<boolean>();
}
