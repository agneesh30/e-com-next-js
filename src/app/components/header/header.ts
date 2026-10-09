import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {CartService} from '../../services/cart.service';
import {CatalogService} from '../../services/catalog.service';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <!-- Main Boutique Navigation Header -->
    <header class="sticky top-0 z-40 bg-white border-b border-[#eaeaec] shadow-2xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        <!-- Left: Logo & Mobile Menu Trigger -->
        <div class="flex items-center gap-3">
          <!-- Mobile Menu Trigger -->
          <button
            type="button"
            (click)="toggleMobileMenu()"
            class="md:hidden p-2 -ml-2 text-[#282c3f] hover:text-[#be185d] transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <mat-icon>{{ isMobileMenuOpen() ? 'close' : 'menu' }}</mat-icon>
          </button>

          <!-- Boutique Brand Logo -->
          <a routerLink="/" class="flex items-center gap-2.5 group">
            <div class="w-9 h-9 rounded-lg bg-[#be185d] flex items-center justify-center text-white shadow-xs">
              <span class="font-serif font-bold text-lg tracking-tight">V</span>
            </div>
            <div class="flex flex-col">
              <span class="font-extrabold tracking-[0.18em] text-base sm:text-lg text-[#282c3f] uppercase leading-none group-hover:text-[#be185d] transition-colors">
                VIRAASAT
              </span>
              <span class="text-[9px] font-semibold tracking-[0.25em] text-[#535766] uppercase mt-0.5">
                INDIAN COUTURE
              </span>
            </div>
          </a>
        </div>

        <!-- Center: Clean Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-7 h-full text-xs font-semibold uppercase tracking-wider text-[#282c3f]">
          <a
            routerLink="/shop"
            routerLinkActive="text-[#be185d] font-bold"
            [routerLinkActiveOptions]="{exact: true}"
            class="hover:text-[#be185d] transition-colors py-2"
          >
            Shop
          </a>
          <a
            routerLink="/collections"
            routerLinkActive="text-[#be185d] font-bold"
            class="hover:text-[#be185d] transition-colors py-2"
          >
            Collections
          </a>
          <a
            routerLink="/categories"
            routerLinkActive="text-[#be185d] font-bold"
            class="hover:text-[#be185d] transition-colors py-2"
          >
            Categories
          </a>
          <a
            routerLink="/about"
            routerLinkActive="text-[#be185d] font-bold"
            class="hover:text-[#be185d] transition-colors py-2"
          >
            About
          </a>
          <a
            routerLink="/contact"
            routerLinkActive="text-[#be185d] font-bold"
            class="hover:text-[#be185d] transition-colors py-2"
          >
            Contact
          </a>
        </nav>

        <!-- Right: Actions (Search, WhatsApp, Enquiry Cart) -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Search Button -->
          <button
            type="button"
            (click)="openSearch()"
            class="p-2 text-[#282c3f] hover:text-[#be185d] hover:bg-[#fafafa] rounded-lg transition-colors cursor-pointer"
            aria-label="Search catalog"
            title="Search Products"
          >
            <mat-icon class="text-xl">search</mat-icon>
          </button>

          <!-- WhatsApp Concierge Button -->
          <button
            type="button"
            (click)="directWhatsAppHelp()"
            class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#25d366] hover:bg-[#25d366]/10 rounded-lg transition-colors cursor-pointer border border-[#25d366]/30"
            title="Chat with Boutique Stylist on WhatsApp"
          >
            <mat-icon class="text-base text-[#25d366]">chat</mat-icon>
            <span class="font-semibold">WhatsApp</span>
          </button>

          <!-- Enquiry Bag Button -->
          <button
            type="button"
            (click)="openCart()"
            class="relative inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 text-xs font-semibold text-[#282c3f] hover:text-[#be185d] hover:bg-[#fafafa] rounded-lg transition-colors cursor-pointer"
            aria-label="View Enquiry Bag"
          >
            <mat-icon class="text-xl">shopping_bag</mat-icon>
            <span class="hidden sm:inline">Enquiry</span>
            @if (cartTotal() > 0) {
              <span class="min-w-4.5 h-4.5 px-1 bg-[#be185d] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {{ cartTotal() }}
              </span>
            }
          </button>

          <!-- Admin Portal Shortcut -->
          <a
            routerLink="/admin"
            class="hidden lg:inline-flex p-2 text-stone-400 hover:text-[#282c3f] transition-colors"
            title="Merchant Admin Portal"
          >
            <mat-icon class="text-lg">admin_panel_settings</mat-icon>
          </a>
        </div>
      </div>

      <!-- Mobile Navigation Drawer -->
      @if (isMobileMenuOpen()) {
        <div class="md:hidden border-t border-[#eaeaec] bg-white px-5 py-5 space-y-4 shadow-lg animate-in fade-in duration-150">
          <nav class="flex flex-col space-y-1 text-sm font-medium text-[#282c3f]">
            <a
              routerLink="/shop"
              (click)="closeMobileMenu()"
              class="px-3 py-2.5 rounded-lg hover:bg-[#fafafa] hover:text-[#be185d] transition-colors flex items-center justify-between"
            >
              <span>Shop All Clothing</span>
              <mat-icon class="text-sm text-stone-400">chevron_right</mat-icon>
            </a>
            <a
              routerLink="/collections"
              (click)="closeMobileMenu()"
              class="px-3 py-2.5 rounded-lg hover:bg-[#fafafa] hover:text-[#be185d] transition-colors flex items-center justify-between"
            >
              <span>Collections</span>
              <mat-icon class="text-sm text-stone-400">chevron_right</mat-icon>
            </a>
            <a
              routerLink="/categories"
              (click)="closeMobileMenu()"
              class="px-3 py-2.5 rounded-lg hover:bg-[#fafafa] hover:text-[#be185d] transition-colors flex items-center justify-between"
            >
              <span>Categories</span>
              <mat-icon class="text-sm text-stone-400">chevron_right</mat-icon>
            </a>
            <a
              routerLink="/about"
              (click)="closeMobileMenu()"
              class="px-3 py-2.5 rounded-lg hover:bg-[#fafafa] hover:text-[#be185d] transition-colors flex items-center justify-between"
            >
              <span>About the Brand</span>
              <mat-icon class="text-sm text-stone-400">chevron_right</mat-icon>
            </a>
            <a
              routerLink="/contact"
              (click)="closeMobileMenu()"
              class="px-3 py-2.5 rounded-lg hover:bg-[#fafafa] hover:text-[#be185d] transition-colors flex items-center justify-between"
            >
              <span>Contact & Concierge</span>
              <mat-icon class="text-sm text-stone-400">chevron_right</mat-icon>
            </a>
          </nav>

          <div class="pt-3 border-t border-[#eaeaec] flex items-center justify-between">
            <button
              type="button"
              (click)="directWhatsAppHelp(); closeMobileMenu()"
              class="inline-flex items-center gap-1.5 text-xs font-semibold text-[#25d366] bg-[#25d366]/10 px-3 py-2 rounded-lg"
            >
              <mat-icon class="text-base">chat</mat-icon>
              <span>WhatsApp Stylist</span>
            </button>

            <a
              routerLink="/admin"
              (click)="closeMobileMenu()"
              class="text-xs text-stone-500 hover:text-[#282c3f] font-medium"
            >
              Admin Portal
            </a>
          </div>
        </div>
      }
    </header>
  `,
})
export class Header {
  private cartService = inject(CartService);
  private catalogService = inject(CatalogService);

  isMobileMenuOpen = signal<boolean>(false);
  settings = this.catalogService.settings;
  cartTotal = this.cartService.totalItems;

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  openCart(): void {
    this.cartService.openDrawer();
  }

  openSearch(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-search-modal'));
    }
  }

  directWhatsAppHelp(): void {
    const settings = this.settings();
    const rawNum = settings.whatsapp_number.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello ${settings.business_name}, I am browsing your catalog and would like assistance with product sizing, customization, and WhatsApp ordering.`
    );
    const url = `https://wa.me/${rawNum}?text=${message}`;
    if (typeof window !== 'undefined') {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }
}

