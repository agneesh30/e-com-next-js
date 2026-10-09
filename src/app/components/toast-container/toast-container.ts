import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {NotificationService} from '../../services/notification.service';

@Component({
  selector: 'app-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div
      class="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      @for (toast of toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-center gap-3 px-4 py-3 bg-stone-900 text-white rounded-xl shadow-xl border border-stone-800 text-xs animate-in slide-in-from-bottom-3 duration-200"
        >
          <mat-icon [class]="getIconColor(toast.type)" class="text-base">
            {{ getIcon(toast.type) }}
          </mat-icon>
          <span class="flex-1 font-medium leading-tight">{{ toast.message }}</span>
          <button
            type="button"
            (click)="dismiss(toast.id)"
            class="text-stone-400 hover:text-white p-0.5"
            aria-label="Dismiss notification"
          >
            <mat-icon class="text-sm">close</mat-icon>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainer {
  private notificationService = inject(NotificationService);

  toasts = this.notificationService.toasts;

  dismiss(id: string): void {
    this.notificationService.dismiss(id);
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  }

  getIconColor(type: string): string {
    switch (type) {
      case 'success': return 'text-emerald-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-amber-400';
      default: return 'text-stone-300';
    }
  }
}
