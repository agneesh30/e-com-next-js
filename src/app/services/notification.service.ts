import {Injectable, signal} from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  toasts = signal<ToastMessage[]>([]);

  show(message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success', durationMs = 3500): void {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newToast: ToastMessage = { id, type, message };

    this.toasts.update(current => [...current, newToast]);

    setTimeout(() => {
      this.dismiss(id);
    }, durationMs);
  }

  dismiss(id: string): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
