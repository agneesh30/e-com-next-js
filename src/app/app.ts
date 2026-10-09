import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {filter, map} from 'rxjs';
import {Header} from './components/header/header';
import {Footer} from './components/footer/footer';
import {CartDrawer} from './components/cart-drawer/cart-drawer';
import {SearchModal} from './components/search-modal/search-modal';
import {ToastContainer} from './components/toast-container/toast-container';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Header,
    Footer,
    CartDrawer,
    SearchModal,
    ToastContainer,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private router = inject(Router);

  private currentUrl$ = this.router.events.pipe(
    filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    map((e) => e.urlAfterRedirects)
  );

  currentUrl = toSignal(this.currentUrl$, { initialValue: this.router.url });

  isAdminRoute = computed(() => {
    const url = this.currentUrl();
    return url.startsWith('/admin');
  });

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
      });
  }
}
