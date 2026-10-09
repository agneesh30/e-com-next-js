import {Injectable, inject, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AdminUser} from '../models/catalog.model';
import {NotificationService} from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private notifications = inject(NotificationService);

  private readonly TOKEN_KEY = 'lumina_admin_token';
  private readonly USER_KEY = 'lumina_admin_user';

  currentUser = signal<AdminUser | null>(null);
  token = signal<string | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem(this.TOKEN_KEY);
      const storedUser = localStorage.getItem(this.USER_KEY);
      if (storedToken && storedUser) {
        try {
          this.token.set(storedToken);
          this.currentUser.set(JSON.parse(storedUser));
          this.isAuthenticated.set(true);
        } catch {
          this.logout();
        }
      }
    }
  }

  login(email: string, password: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.http.post<{ token: string; user: AdminUser }>('/api/auth/login', { email, password }).subscribe({
        next: (res) => {
          this.token.set(res.token);
          this.currentUser.set(res.user);
          this.isAuthenticated.set(true);
          if (typeof window !== 'undefined') {
            localStorage.setItem(this.TOKEN_KEY, res.token);
            localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
          }
          this.notifications.show(`Welcome back, ${res.user.name}`, 'success');
          resolve(true);
        },
        error: () => {
          // Fallback demo credentials if offline
          if (
            (email === 'admin@business.com' && password === 'admin123') ||
            (email === 'admin@lumina-atelier.com' && password === 'admin123')
          ) {
            const fallbackUser: AdminUser = {
              id: 'usr_admin_1',
              name: 'Store Owner',
              email,
              role: 'superadmin',
            };
            const fallbackToken = 'demo_token_' + Date.now();
            this.token.set(fallbackToken);
            this.currentUser.set(fallbackUser);
            this.isAuthenticated.set(true);
            if (typeof window !== 'undefined') {
              localStorage.setItem(this.TOKEN_KEY, fallbackToken);
              localStorage.setItem(this.USER_KEY, JSON.stringify(fallbackUser));
            }
            this.notifications.show('Signed in as Store Owner', 'success');
            resolve(true);
            return;
          }
          this.notifications.show('Invalid email or password', 'error');
          resolve(false);
        },
      });
    });
  }

  logout(): void {
    const currentToken = this.token();
    if (currentToken) {
      this.http.post('/api/auth/logout', {}, {
        headers: { Authorization: `Bearer ${currentToken}` }
      }).subscribe({ error: (err) => console.warn(err) });
    }

    this.token.set(null);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.notifications.show('Signed out successfully', 'info');
  }
}
