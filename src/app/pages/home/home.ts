import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {CatalogService} from '../../services/catalog.service';
import {ProductCard} from '../../components/product-card/product-card';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule, ProductCard],
  template: `
    <div class="space-y-16 sm:space-y-24 pb-20">

      <!-- 1. HERO SECTION -->
      <section class="relative bg-white border-b border-[#eaeaec] overflow-hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            
            <!-- Left Hero Content -->
            <div class="lg:col-span-7 space-y-6 text-left">
              <span class="inline-block text-[11px] font-bold tracking-[0.25em] text-[#be185d] uppercase">
                Handcrafted Indian Couture
              </span>

              <h1 class="font-serif font-normal text-4xl sm:text-6xl lg:text-7xl tracking-tight text-[#282c3f] leading-[1.08] text-balance">
                Timeless Indian Elegance
              </h1>

              <p class="text-sm sm:text-base text-[#535766] font-normal leading-relaxed max-w-xl">
                Discover our curated collection of contemporary and traditional wear. Pure Banarasi silks, artisanal Lehengas, and refined Kurta sets crafted by master artisans.
              </p>

              <!-- Hero CTA -->
              <div class="pt-2 flex flex-wrap items-center gap-4">
                <a
                  routerLink="/shop"
                  class="px-8 py-3.5 text-xs font-bold tracking-wider uppercase text-white bg-[#be185d] hover:bg-[#9d174d] rounded-lg shadow-sm hover:shadow-md transition-all active:scale-98 cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Explore Catalog</span>
                  <mat-icon class="text-sm">arrow_forward</mat-icon>
                </a>

                <button
                  type="button"
                  (click)="openDirectWhatsApp()"
                  class="px-6 py-3.5 text-xs font-semibold tracking-wider uppercase text-[#25d366] hover:bg-[#25d366]/10 border border-[#25d366]/40 rounded-lg transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <mat-icon class="text-base text-[#25d366]">chat</mat-icon>
                  <span>WhatsApp Concierge</span>
                </button>
              </div>

              <!-- Refined Craftsmanship Highlights -->
              <div class="pt-8 border-t border-[#f5f5f6] flex flex-wrap items-center gap-8 text-xs text-[#535766] font-medium">
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#be185d]"></span>
                  <span>100% Authentic Handloom</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#25d366]"></span>
                  <span>Direct WhatsApp Ordering</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#be185d]"></span>
                  <span>Pan-India Express Delivery</span>
                </div>
              </div>
            </div>

            <!-- Right Hero Imagery -->
            <div class="lg:col-span-5">
              <div class="relative rounded-2xl overflow-hidden aspect-3/4 bg-[#f8f8f9] shadow-md border border-[#eaeaec] group">
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85"
                  alt="Timeless Indian Saree"
                  class="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-102"
                  referrerpolicy="no-referrer"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-6">
                  <div class="text-white">
                    <span class="text-[10px] font-bold tracking-[0.2em] uppercase text-rose-200 block">Artisanal Edition</span>
                    <span class="font-serif text-lg font-medium text-white">Pure Katan Silk Saree</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- 2. SHOP BY CATEGORY -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-end justify-between mb-8 pb-3 border-b border-[#eaeaec]">
          <div>
            <span class="text-[11px] font-bold tracking-[0.2em] text-[#be185d] uppercase block mb-1">
              Curated Wardrobe
            </span>
            <h2 class="text-2xl sm:text-3xl font-serif text-[#282c3f]">
              Shop by Category
            </h2>
          </div>
          <a routerLink="/categories" class="text-xs font-semibold text-[#be185d] hover:underline flex items-center gap-1">
            <span>View All Categories</span>
            <mat-icon class="text-sm">chevron_right</mat-icon>
          </a>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          @for (cat of categories(); track cat.id) {
            <a
              [routerLink]="['/shop']"
              [queryParams]="{category: cat.slug}"
              class="group flex flex-col items-center text-center p-3 rounded-xl bg-white border border-[#eaeaec] hover:border-[#be185d] hover:shadow-xs transition-all cursor-pointer"
            >
              <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden p-1 bg-[#fdf2f8] ring-1 ring-[#eaeaec] group-hover:ring-[#be185d] transition-all shrink-0">
                <img
                  [src]="cat.image_url"
                  [alt]="cat.name"
                  class="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
                  referrerpolicy="no-referrer"
                />
              </div>
              <span class="font-semibold text-xs sm:text-sm text-[#282c3f] mt-3 group-hover:text-[#be185d] transition-colors line-clamp-1">
                {{ cat.name }}
              </span>
              <span class="text-[11px] text-[#535766] mt-0.5">
                {{ cat.count }} items
              </span>
            </a>
          }
        </div>
      </section>

      <!-- 3. FEATURED PRODUCTS -->
      @if (featuredProducts().length > 0) {
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-end justify-between mb-8 pb-3 border-b border-[#eaeaec]">
            <div>
              <span class="text-[11px] font-bold tracking-[0.2em] text-[#be185d] uppercase block mb-1">
                Handpicked Highlights
              </span>
              <h2 class="text-2xl sm:text-3xl font-serif text-[#282c3f]">
                Featured Collection
              </h2>
            </div>
            <a routerLink="/shop" class="text-xs font-semibold text-[#be185d] hover:underline flex items-center gap-1">
              <span>View All</span>
              <mat-icon class="text-sm">chevron_right</mat-icon>
            </a>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            @for (product of featuredProducts(); track product.id) {
              <app-product-card [product]="product"></app-product-card>
            }
          </div>
        </section>
      }

      <!-- 4. NEW ARRIVALS -->
      @if (newArrivals().length > 0) {
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-end justify-between mb-8 pb-3 border-b border-[#eaeaec]">
            <div>
              <span class="text-[11px] font-bold tracking-[0.2em] text-[#be185d] uppercase block mb-1">
                Recently Added
              </span>
              <h2 class="text-2xl sm:text-3xl font-serif text-[#282c3f]">
                New Arrivals
              </h2>
            </div>
            <a routerLink="/shop" class="text-xs font-semibold text-[#be185d] hover:underline flex items-center gap-1">
              <span>Explore Shop</span>
              <mat-icon class="text-sm">chevron_right</mat-icon>
            </a>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            @for (product of newArrivals(); track product.id) {
              <app-product-card [product]="product"></app-product-card>
            }
          </div>
        </section>
      }

      <!-- 5. ABOUT THE BRAND -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-2xl border border-[#eaeaec] p-8 sm:p-12 lg:p-16">
          <div class="max-w-3xl space-y-5">
            <span class="text-[11px] font-bold tracking-[0.25em] text-[#be185d] uppercase block">
              About The Atelier
            </span>
            <h2 class="font-serif text-2xl sm:text-4xl text-[#282c3f] leading-snug">
              Celebrating Heritage Textiles & Master Handloom Weavers
            </h2>
            <p class="text-sm sm:text-base text-[#535766] leading-relaxed">
              Viraasat Couture curates genuine Indian handlooms and bespoke bridal drapes directly from artisan clusters in Varanasi, Jaipur, and Surat. Every piece is examined for fabric density, genuine zari lustre, and authentic tailoring before being shared with you.
            </p>
            <div class="pt-2">
              <a
                routerLink="/about"
                class="inline-flex items-center gap-1.5 text-xs font-bold text-[#be185d] hover:underline"
              >
                <span>Read our weaving story</span>
                <mat-icon class="text-xs">arrow_forward</mat-icon>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. WHATSAPP ORDERING CONCIERGE -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white border border-[#eaeaec] rounded-2xl p-8 sm:p-12">
          <div class="max-w-3xl space-y-6">
            <div class="inline-flex items-center gap-2 bg-[#25d366]/10 text-[#25d366] px-3 py-1 rounded-full text-xs font-bold">
              <mat-icon class="text-sm">chat</mat-icon>
              <span>Personalized Concierge</span>
            </div>

            <h2 class="font-serif text-2xl sm:text-3xl text-[#282c3f]">
              How WhatsApp Ordering Works
            </h2>

            <p class="text-xs sm:text-sm text-[#535766] leading-relaxed">
              No account creation or online payment gateways. Browse our catalog, select your size and color, and connect directly with our stylist on WhatsApp to finalize measurements and confirm your order.
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div class="p-4 bg-[#fafafa] rounded-xl border border-[#eaeaec] space-y-1">
                <span class="text-xs font-bold text-[#be185d]">01</span>
                <h4 class="text-xs font-bold text-[#282c3f]">Select Products</h4>
                <p class="text-[11px] text-[#535766]">Choose desired color, size, and add to enquiry.</p>
              </div>

              <div class="p-4 bg-[#fafafa] rounded-xl border border-[#eaeaec] space-y-1">
                <span class="text-xs font-bold text-[#be185d]">02</span>
                <h4 class="text-xs font-bold text-[#282c3f]">Send WhatsApp</h4>
                <p class="text-[11px] text-[#535766]">Click send to share your formatted enquiry list.</p>
              </div>

              <div class="p-4 bg-[#fafafa] rounded-xl border border-[#eaeaec] space-y-1">
                <span class="text-xs font-bold text-[#25d366]">03</span>
                <h4 class="text-xs font-bold text-[#282c3f]">Confirm & Stitch</h4>
                <p class="text-[11px] text-[#535766]">Confirm blouse fit, photos, and delivery details.</p>
              </div>
            </div>

            <div class="pt-2">
              <button
                type="button"
                (click)="openDirectWhatsApp()"
                class="px-6 py-3 text-xs font-bold uppercase tracking-wider text-white bg-[#25d366] hover:bg-[#20ba59] rounded-lg transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <mat-icon class="text-base">chat</mat-icon>
                <span>Chat with Boutique Concierge</span>
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  `,
})
export class Home {
  private catalogService = inject(CatalogService);

  settings = this.catalogService.settings;
  categories = this.catalogService.categoriesWithCounts;

  featuredProducts = computed(() => {
    return this.catalogService.activeProducts().filter(p => p.featured).slice(0, 8);
  });

  newArrivals = computed(() => {
    return [...this.catalogService.activeProducts()]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8);
  });

  openDirectWhatsApp(): void {
    const s = this.settings();
    const raw = s.whatsapp_number.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hello ${s.business_name}, I am browsing your Indian ethnic wear catalog and would like styling assistance and to place an order.`);
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
