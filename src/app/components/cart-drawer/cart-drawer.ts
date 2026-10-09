import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {CartService} from '../../services/cart.service';
import {CatalogService} from '../../services/catalog.service';

@Component({
  selector: 'app-cart-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  template: `
    @if (isOpen()) {
      <!-- Backdrop Overlay -->
      <div
        class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity"
        (click)="close()"
        aria-hidden="true"
      ></div>

      <!-- Slide-over Drawer Panel (Myntra Style Bag) -->
      <aside
        class="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#fafafb] shadow-2xl flex flex-col transition-transform duration-300 ease-out"
        role="dialog"
        aria-modal="true"
        aria-label="Enquiry Bag"
      >
        <!-- Header with Myntra Pink Accents -->
        <div class="px-6 py-4.5 bg-white border-b border-[#eaeaec] flex items-center justify-between shadow-xs">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-[#fff0f5] text-[#ff3f6c] flex items-center justify-center">
              <mat-icon class="text-lg">shopping_bag</mat-icon>
            </div>
            <div>
              <h2 class="text-sm font-black uppercase tracking-wider text-[#282c3f]">Enquiry Bag</h2>
              <p class="text-[11px] text-[#535766] font-medium">
                {{ totalItems() }} item{{ totalItems() === 1 ? '' : 's' }} selected for WhatsApp order
              </p>
            </div>
          </div>

          <button
            type="button"
            (click)="close()"
            class="p-1.5 text-stone-400 hover:text-[#282c3f] hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
            aria-label="Close bag"
          >
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <!-- Scrollable Content Area -->
        <div class="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          @if (items().length === 0) {
            <!-- Empty State -->
            <div class="py-16 text-center flex flex-col items-center justify-center bg-white rounded-xl p-8 border border-[#eaeaec]">
              <div class="w-20 h-20 rounded-full bg-[#fff0f5] flex items-center justify-center text-[#ff3f6c] mb-4">
                <mat-icon class="text-4xl">shopping_bag</mat-icon>
              </div>
              <h3 class="text-base font-black text-[#282c3f] mb-1">Hey, your enquiry bag is empty!</h3>
              <p class="text-xs text-[#535766] max-w-xs mb-6 leading-relaxed">
                Explore our festive sarees, lehengas, and kurtas to send an instant order on WhatsApp.
              </p>
              <button
                type="button"
                (click)="close()"
                routerLink="/products"
                class="px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-[#ff3f6c] hover:bg-[#e0325d] rounded-lg shadow-md cursor-pointer"
              >
                Explore Ethnic Wear
              </button>
            </div>
          } @else {
            <!-- Items List -->
            <div class="space-y-3">
              @for (item of items(); track item.product.id) {
                <div class="p-3.5 bg-white border border-[#eaeaec] rounded-xl flex items-start gap-3 shadow-xs">
                  <!-- Thumbnail -->
                  <div class="w-18 h-22 rounded-lg bg-[#fbf5f7] overflow-hidden shrink-0 border border-[#eaeaec]">
                    <img
                      [src]="item.product.images[0]?.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80'"
                      [alt]="item.product.name"
                      class="w-full h-full object-cover object-top"
                      referrerpolicy="no-referrer"
                    />
                  </div>

                  <!-- Details -->
                  <div class="flex-1 min-w-0">
                    <span class="text-[11px] font-black uppercase text-[#282c3f] tracking-wide block truncate">
                      {{ item.product.brand || 'VIRAASAT' }}
                    </span>
                    <h4 class="text-xs text-[#535766] truncate mt-0.5">
                      {{ item.product.name }}
                    </h4>

                    <!-- Size / Color tags -->
                    <div class="mt-1 flex items-center gap-1.5 text-[10px]">
                      @if (item.selectedSize) {
                        <span class="bg-[#fff0f5] text-[#ff3f6c] font-black px-1.5 py-0.5 rounded border border-[#ff3f6c]/30">
                          Size: {{ item.selectedSize }}
                        </span>
                      }
                      @if (item.product.color) {
                        <span class="bg-[#f5f5f6] text-[#535766] font-medium px-1.5 py-0.5 rounded">
                          {{ item.product.color }}
                        </span>
                      }
                    </div>

                    <!-- Price Row -->
                    <div class="flex items-baseline gap-2 mt-2">
                      <span class="text-xs sm:text-sm font-black text-[#282c3f] tabular-nums">
                        {{ currencySymbol() }}{{ item.product.price.toLocaleString() }}
                      </span>
                      @if (item.product.discount_price && item.product.discount_price > item.product.price) {
                        <span class="text-[10px] text-[#94969f] line-through tabular-nums">
                          {{ currencySymbol() }}{{ item.product.discount_price.toLocaleString() }}
                        </span>
                      }
                    </div>

                    <!-- Stepper & Remove -->
                    <div class="flex items-center justify-between mt-2 pt-2 border-t border-[#f5f5f6]">
                      <div class="inline-flex items-center border border-[#eaeaec] rounded bg-[#f5f5f6]">
                        <button
                          type="button"
                          (click)="changeQty(item.product.id, item.quantity - 1)"
                          class="px-2 py-0.5 text-stone-600 hover:bg-stone-200 transition-colors text-xs font-bold cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span class="px-2.5 py-0.5 text-xs font-black tabular-nums text-[#282c3f]">
                          {{ item.quantity }}
                        </span>
                        <button
                          type="button"
                          (click)="changeQty(item.product.id, item.quantity + 1)"
                          class="px-2 py-0.5 text-stone-600 hover:bg-stone-200 transition-colors text-xs font-bold cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        (click)="removeItem(item.product.id)"
                        class="text-[11px] text-[#94969f] hover:text-[#ff3f6c] font-semibold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Customer Details Form -->
            <div class="p-4 bg-white border border-[#eaeaec] rounded-xl space-y-3">
              <h4 class="text-xs font-black uppercase tracking-wider text-[#282c3f]">
                Delivery & Contact Details (Optional)
              </h4>

              <div>
                <label for="cart-cust-name" class="block text-[11px] font-bold text-[#535766] mb-1">Your Full Name</label>
                <input
                  id="cart-cust-name"
                  type="text"
                  placeholder="e.g. Ananya Sharma"
                  [value]="customerName()"
                  (input)="customerName.set($any($event.target).value)"
                  class="w-full text-xs px-3 py-2 bg-[#f5f5f6] border border-[#eaeaec] rounded-lg focus:outline-none focus:border-[#ff3f6c]"
                />
              </div>

              <div>
                <label for="cart-cust-loc" class="block text-[11px] font-bold text-[#535766] mb-1">City / Pincode</label>
                <input
                  id="cart-cust-loc"
                  type="text"
                  placeholder="e.g. Bangalore, 560001"
                  [value]="customerLocation()"
                  (input)="customerLocation.set($any($event.target).value)"
                  class="w-full text-xs px-3 py-2 bg-[#f5f5f6] border border-[#eaeaec] rounded-lg focus:outline-none focus:border-[#ff3f6c]"
                />
              </div>

              <div>
                <label for="cart-cust-notes" class="block text-[11px] font-bold text-[#535766] mb-1">Enquiry Notes / Special Instructions (Optional)</label>
                <textarea
                  id="cart-cust-notes"
                  rows="2"
                  placeholder="e.g. Preferred dispatch timeframe, color confirmation..."
                  [value]="customerNotes()"
                  (input)="customerNotes.set($any($event.target).value)"
                  class="w-full text-xs px-3 py-2 bg-[#f5f5f6] border border-[#eaeaec] rounded-lg focus:outline-none focus:border-[#ff3f6c] resize-none"
                ></textarea>
              </div>

              <!-- Message Preview -->
              <div class="pt-1">
                <button
                  type="button"
                  (click)="togglePreview()"
                  class="text-[11px] text-[#ff3f6c] font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <mat-icon class="text-xs">{{ showPreview() ? 'expand_less' : 'expand_more' }}</mat-icon>
                  <span>{{ showPreview() ? 'Hide' : 'Preview' }} formatted WhatsApp message</span>
                </button>

                @if (showPreview()) {
                  <div class="mt-2 p-3 bg-[#f5f5f6] border border-[#eaeaec] rounded-lg text-[11px] font-mono text-[#282c3f] whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                    {{ previewMessage() }}
                  </div>
                }
              </div>
            </div>

            <!-- Price Breakdown -->
            <div class="p-4 bg-white border border-[#eaeaec] rounded-xl space-y-2 text-xs">
              <div class="font-black uppercase tracking-wider text-[#282c3f] text-[11px] mb-1">
                Estimated Order Summary ({{ totalItems() }} Item{{ totalItems() === 1 ? '' : 's' }})
              </div>
              <div class="flex items-center justify-between text-[#535766]">
                <span>Estimated Subtotal</span>
                <span>{{ currencySymbol() }}{{ estimatedTotal().toLocaleString() }}</span>
              </div>
              <div class="flex items-center justify-between text-[#535766]">
                <span>Pan-India Delivery</span>
                <span class="text-[#03a685] font-bold">FREE</span>
              </div>
              <div class="pt-2 border-t border-[#f5f5f6] flex items-center justify-between text-sm font-black text-[#282c3f]">
                <span>Total Estimated Amount</span>
                <span class="tabular-nums">{{ currencySymbol() }}{{ estimatedTotal().toLocaleString() }}</span>
              </div>
            </div>
          }
        </div>

        <!-- Sticky Bottom Actions -->
        @if (items().length > 0) {
          <div class="p-4 bg-white border-t border-[#eaeaec] space-y-2.5 shadow-lg">
            <button
              type="button"
              (click)="sendWhatsApp()"
              class="w-full py-3.5 px-4 text-xs font-black uppercase tracking-wider text-white bg-[#25d366] hover:bg-[#20ba59] rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <mat-icon class="text-lg">chat</mat-icon>
              <span>Send Order on WhatsApp</span>
            </button>

            <div class="flex items-center justify-between px-1">
              <button
                type="button"
                (click)="clearCart()"
                class="text-xs text-[#94969f] hover:text-[#ff3f6c] font-semibold cursor-pointer"
              >
                Clear Bag
              </button>
              <button
                type="button"
                (click)="close()"
                class="text-xs text-[#ff3f6c] font-bold cursor-pointer hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        }
      </aside>
    }
  `,
})
export class CartDrawer {
  private cartService = inject(CartService);
  private catalogService = inject(CatalogService);

  isOpen = this.cartService.isDrawerOpen;
  items = this.cartService.items;
  totalItems = this.cartService.totalItems;
  estimatedTotal = this.cartService.estimatedTotal;

  customerName = signal<string>('');
  customerLocation = signal<string>('');
  customerNotes = signal<string>('');
  showPreview = signal<boolean>(false);

  currencySymbol = computed(() => {
    return this.catalogService.settings().currency_symbol || '₹';
  });

  previewMessage = computed(() => {
    return this.cartService.buildCartMessage(
      this.customerName(),
      this.customerLocation(),
      this.customerNotes()
    );
  });

  close(): void {
    this.cartService.closeDrawer();
  }

  togglePreview(): void {
    this.showPreview.update(v => !v);
  }

  changeQty(productId: string, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
  }

  removeItem(productId: string): void {
    this.cartService.removeItem(productId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  sendWhatsApp(): void {
    this.cartService.sendWhatsAppEnquiry(
      this.customerName(),
      this.customerLocation(),
      this.customerNotes()
    );
    this.close();
  }
}
