import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {CatalogService} from '../../services/catalog.service';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  template: `
    <footer class="bg-[#f5f5f6] text-[#535766] pt-12 pb-10 border-t border-[#eaeaec]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <!-- Myntra Assurance Guarantee Strip -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-10 border-b border-[#eaeaec]">
          <div class="flex items-center gap-3.5 bg-white p-4 rounded-xl border border-[#eaeaec] shadow-xs">
            <div class="w-12 h-12 rounded-full bg-[#fff0f5] text-[#ff3f6c] flex items-center justify-center shrink-0">
              <mat-icon class="text-2xl">verified</mat-icon>
            </div>
            <div>
              <h4 class="text-xs font-black uppercase text-[#282c3f]">100% Original Heritage</h4>
              <p class="text-[11px] text-[#535766] mt-0.5">Authentic handloom silks & master artisan embroidery</p>
            </div>
          </div>

          <div class="flex items-center gap-3.5 bg-white p-4 rounded-xl border border-[#eaeaec] shadow-xs">
            <div class="w-12 h-12 rounded-full bg-[#ecfdf5] text-[#03a685] flex items-center justify-center shrink-0">
              <mat-icon class="text-2xl">chat</mat-icon>
            </div>
            <div>
              <h4 class="text-xs font-black uppercase text-[#282c3f]">Instant WhatsApp Support</h4>
              <p class="text-[11px] text-[#535766] mt-0.5">Custom sizing, blouse fit & live video calling</p>
            </div>
          </div>

          <div class="flex items-center gap-3.5 bg-white p-4 rounded-xl border border-[#eaeaec] shadow-xs">
            <div class="w-12 h-12 rounded-full bg-[#fff6ed] text-[#ff6a00] flex items-center justify-center shrink-0">
              <mat-icon class="text-2xl">local_shipping</mat-icon>
            </div>
            <div>
              <h4 class="text-xs font-black uppercase text-[#282c3f]">Express Pan-India Delivery</h4>
              <p class="text-[11px] text-[#535766] mt-0.5">Insured doorstep dispatch across all pincodes</p>
            </div>
          </div>
        </div>

        <!-- 4 Columns Footer Links -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-[#eaeaec] text-xs">
          
          <!-- Col 1: Brand & Philosophy -->
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#ff3f6c] to-[#ff7555] flex items-center justify-center text-white font-serif font-black text-base">
                V
              </div>
              <span class="font-black text-base tracking-wider text-[#282c3f] uppercase">
                {{ settings().business_name }}
              </span>
            </div>
            <p class="text-[11px] text-[#535766] leading-relaxed">
              {{ settings().about }}
            </p>
            <div class="pt-1">
              <button
                type="button"
                (click)="openWhatsApp()"
                class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-[#25d366] hover:bg-[#20ba59] rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <mat-icon class="text-base">chat</mat-icon>
                <span>WhatsApp: {{ settings().phone }}</span>
              </button>
            </div>
          </div>

          <!-- Col 2: Online Shopping Categories -->
          <div class="space-y-2.5">
            <h4 class="font-black uppercase tracking-wider text-[#282c3f] text-xs">
              Ethnic Collections
            </h4>
            <ul class="space-y-1.5 text-xs text-[#535766]">
              @for (cat of categories(); track cat.id) {
                <li>
                  <a
                    [routerLink]="['/products']"
                    [queryParams]="{category: cat.slug}"
                    class="hover:text-[#ff3f6c] transition-colors"
                  >
                    {{ cat.name }}
                  </a>
                </li>
              }
              <li>
                <a routerLink="/products" class="text-[#ff3f6c] font-bold hover:underline">
                  All Indian Wear Catalog &rarr;
                </a>
              </li>
            </ul>
          </div>

          <!-- Col 3: Boutique Store & Timings -->
          <div class="space-y-2.5">
            <h4 class="font-black uppercase tracking-wider text-[#282c3f] text-xs">
              Studio Location & Hours
            </h4>
            <div class="text-[11px] text-[#535766] space-y-1.5 leading-relaxed">
              <p class="text-[#282c3f] font-bold">{{ settings().city || 'Jaipur' }} Boutique</p>
              <p>{{ settings().address }}</p>
              <p class="pt-1 text-[#282c3f] font-bold">Styling Concierge Hours</p>
              <p>{{ settings().business_hours }}</p>
              @if (settings().google_maps_url) {
                <div class="pt-1">
                  <a
                    [href]="settings().google_maps_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-[#ff3f6c] font-bold inline-flex items-center gap-1 hover:underline"
                  >
                    <span>View on Google Maps</span>
                    <mat-icon class="text-xs">open_in_new</mat-icon>
                  </a>
                </div>
              }
            </div>
          </div>

          <!-- Col 4: Quick Links & Merchant Access -->
          <div class="space-y-2.5">
            <h4 class="font-black uppercase tracking-wider text-[#282c3f] text-xs">
              Customer Policies & Concierge
            </h4>
            <ul class="space-y-1.5 text-xs text-[#535766]">
              <li><a routerLink="/about" class="hover:text-[#ff3f6c] transition-colors">Our Weaving Heritage</a></li>
              <li><a routerLink="/contact" class="hover:text-[#ff3f6c] transition-colors">Contact Boutique Concierge</a></li>
              <li><a routerLink="/collections" class="hover:text-[#ff3f6c] transition-colors">Curated Collections</a></li>
              <li><a routerLink="/categories" class="hover:text-[#ff3f6c] transition-colors">Shop by Category</a></li>
              <li class="pt-2">
                <a
                  routerLink="/admin"
                  class="inline-flex items-center gap-1 text-[#7e818c] hover:text-[#ff3f6c] font-semibold"
                >
                  <mat-icon class="text-xs">admin_panel_settings</mat-icon>
                  <span>Merchant Admin Portal</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        <!-- Copyright Bottom -->
        <div class="flex flex-col sm:flex-row items-center justify-between text-xs text-[#7e818c] gap-3">
          <p>© 2026 {{ settings().business_name }}. Crafted with Pride in India. All Rights Reserved.</p>
          <div class="flex items-center gap-4 text-xs">
            <span class="text-[#282c3f] font-bold">100% Secure WhatsApp Ordering</span>
            <span>·</span>
            <span>Pan-India Logistics</span>
          </div>
        </div>

      </div>
    </footer>
  `,
})
export class Footer {
  private catalogService = inject(CatalogService);

  settings = this.catalogService.settings;
  categories = this.catalogService.categories;

  openWhatsApp(): void {
    const s = this.settings();
    const raw = s.whatsapp_number.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hello ${s.business_name}, I am contacting you from the website catalog.`);
    const url = `https://wa.me/${raw}?text=${message}`;
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
