import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { FormErrorComponent } from '@shared/components/form-error/form-error.component';

type AuthMode = 'login' | 'register';
type LoginField = 'fullName' | 'email' | 'password';

/** Sign-in / sign-up page with client-side validation mirroring the server rules. */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormErrorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly mode = signal<AuthMode>('login');
  protected readonly loading = signal(false);
  protected readonly serverError = signal('');

  protected readonly form = this.formBuilder.nonNullable.group({
    fullName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
  });

  protected toggleMode(): void {
    const next: AuthMode = this.mode() === 'login' ? 'register' : 'login';
    this.mode.set(next);
    this.serverError.set('');
    const fullName = this.form.controls.fullName;
    fullName.setValidators(next === 'register' ? [Validators.required, Validators.minLength(2)] : []);
    fullName.updateValueAndValidity();
  }

  protected hasError(field: LoginField): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { fullName, email, password } = this.form.getRawValue();
    this.loading.set(true);
    this.serverError.set('');

    if (this.mode() === 'login') {
      this.signIn(email, password);
      return;
    }
    this.auth.register(fullName, email, password).subscribe({
      next: () => this.signIn(email, password),
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  private signIn(email: string, password: string): void {
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigateByUrl('/library'),
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  private handleError(error: HttpErrorResponse): void {
    this.loading.set(false);
    this.serverError.set(error.error?.message ?? 'Le serveur est indisponible. Réessayez plus tard.');
  }
}
