import { Component, inject, signal } from '@angular/core';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { switchMap } from 'rxjs/operators';
import { catchError, of } from 'rxjs';
import { LoginService } from '../../../services/auth/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [ReactiveFormsModule],
  standalone: true
})
export class LoginComponent {
  private authService = inject(AuthService);
  private LoginService = inject(LoginService);
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

onSubmit(): void {
    this.isSubmitted = true;
    if (this.form.valid) {
      this.loading.set(true);
      this.LoginService.login(this.form.value)
        .subscribe({
          next: (response: any) => {
            this.authService.setUser(response);
            // this.toastService.showMessage('success', 'Successful', 'User Login Successfully!');
            this.loading.set(false);
            this.form.reset();
            this.router.navigate(['/admin']);
          },
          error: (error) => {
            console.error('Error login user:', error);
            if (error.error.message || error.error.title) {
              // this.toastService.showMessage('error', 'Error', `${error.error.status} : ${error.error.message || error.error.title}`);
            }
          }
        });
      this.isSubmitted = true;
    } else {
      // this.toastService.showMessage('warn', 'Warning', 'Form is invalid! Please Fill All Recommended Field!');
    }
  };



}
