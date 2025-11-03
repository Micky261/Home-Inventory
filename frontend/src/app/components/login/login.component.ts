import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-box">
        <h1 i18n="@@login.title">Login</h1>

        <div *ngIf="error" class="error-message">
          {{ error }}
        </div>

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label i18n="@@login.username">Username</label>
            <input
              type="text"
              [(ngModel)]="username"
              name="username"
              required
              autocomplete="username"
            />
          </div>

          <div class="form-group">
            <label i18n="@@login.password">Password</label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              required
              autocomplete="current-password"
            />
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%;" i18n="@@login.button">
            Login
          </button>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  onSubmit() {
    this.error = '';

    this.apiService.login(this.username, this.password).subscribe({
      next: (response) => {
        localStorage.setItem('auth_token', response.token);
        this.router.navigate(['/items']);
      },
      error: (err) => {
        this.error = 'Invalid credentials';
        console.error('Login error:', err);
      }
    });
  }
}
