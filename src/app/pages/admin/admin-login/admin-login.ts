import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {AuthService} from '../../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-stone-100/60">
      <div class="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-stone-200/90 space-y-6">
        
        <!-- Header -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-[#ff3f6c] to-[#ff7555] text-white mb-2 shadow-md">
            <mat-icon class="text-2xl">admin_panel_settings</mat-icon>
          </div>
          <h1 class="font-black text-2xl tracking-tight text-[#282c3f] uppercase">
            Merchant Admin Portal
          </h1>
          <p class="text-xs text-[#535766]">
            Sign in to manage catalog items, categories, WhatsApp settings, and orders.
          </p>
        </div>

        <!-- Quick Demo Credentials Callout -->
        <div class="p-3.5 bg-[#fff0f5] border border-pink-200 rounded-xl text-xs space-y-2">
          <div class="flex items-center justify-between text-[#ff3f6c] font-bold">
            <span>Demo Credentials</span>
            <button
              type="button"
              (click)="fillDemoCredentials()"
              class="text-xs text-[#ff3f6c] hover:underline font-black cursor-pointer"
            >
              1-Click Fill
            </button>
          </div>
          <div class="font-mono text-[11px] text-[#535766]">
            Email: <span class="text-[#282c3f] font-bold">admin&#64;business.com</span><br/>
            Password: <span class="text-[#282c3f] font-bold">admin123</span>
          </div>
        </div>

        <!-- Login Form -->
        <form (submit)="onSubmit($event)" class="space-y-4">
          <div>
            <label for="admin-email" class="block text-xs font-bold text-[#282c3f] mb-1">Admin Email</label>
            <input
              id="admin-email"
              type="email"
              required
              placeholder="admin@business.com"
              [value]="email()"
              (input)="email.set($any($event.target).value)"
              class="w-full text-xs px-3.5 py-2.5 border border-[#eaeaec] rounded-lg focus:outline-none focus:border-[#ff3f6c] text-[#282c3f]"
            />
          </div>

          <div>
            <label for="admin-password" class="block text-xs font-bold text-[#282c3f] mb-1">Password</label>
            <input
              id="admin-password"
              type="password"
              required
              placeholder="••••••••"
              [value]="password()"
              (input)="password.set($any($event.target).value)"
              class="w-full text-xs px-3.5 py-2.5 border border-[#eaeaec] rounded-lg focus:outline-none focus:border-[#ff3f6c] text-[#282c3f]"
            />
          </div>

          <button
            type="submit"
            [disabled]="isLoading()"
            class="w-full py-3 px-4 text-xs font-black uppercase tracking-wider text-white bg-[#ff3f6c] hover:bg-[#e0325d] rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            @if (isLoading()) {
              <mat-icon class="animate-spin text-base">refresh</mat-icon>
              <span>Verifying...</span>
            } @else {
              <mat-icon class="text-base">lock_open</mat-icon>
              <span>Sign In to Dashboard</span>
            }
          </button>
        </form>

        <div class="text-center pt-2 border-t border-stone-100">
          <a routerLink="/" class="text-xs text-stone-500 hover:text-stone-800 transition-colors">
            &larr; Return to Public Storefront
          </a>
        </div>

      </div>
    </div>
  `,
})
export class AdminLogin {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = signal<string>('admin@business.com');
  password = signal<string>('admin123');
  isLoading = signal<boolean>(false);

  fillDemoCredentials(): void {
    this.email.set('admin@business.com');
    this.password.set('admin123');
  }

  async onSubmit(e: Event): Promise<void> {
    e.preventDefault();
    this.isLoading.set(true);

    try {
      const ok = await this.authService.login(this.email(), this.password());
      if (ok) {
        this.router.navigate(['/admin']);
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
