import { Component, inject, signal } from '@angular/core';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { switchMap } from 'rxjs/operators';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [ReactiveFormsModule],
  standalone: true
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(NonNullableFormBuilder);

  isSubmitted = false;
  loading = signal(false);
  errorMessage = signal('');

  // Reactive form
  form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', Validators.required]
  });

  constructor() { }

  // Shortcut to get form controls
  getControl(controlName: string): FormControl {
    return this.form.get(controlName) as FormControl;
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading.set(true);

    this.authService
      .login(this.form.getRawValue())
      .pipe(
        switchMap(() => this.authService.loadUser()),
        catchError(() => {
          this.loading.set(false);
          this.errorMessage.set('Invalid username or password');
          return of(null);
        })
      )
      .subscribe(user => {
        this.loading.set(false);
        if (user) {
          this.router.navigateByUrl('/admin');
        }
      });
  }



}
