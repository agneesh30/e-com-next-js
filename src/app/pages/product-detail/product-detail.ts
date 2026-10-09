import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {CatalogService} from '../../services/catalog.service';
import {CartService} from '../../services/cart.service';
import {ClothingSize, Product} from '../../models/catalog.model';
import {ProductCard} from '../../components/product-card/product-card';

@Component({
  selector: 'app-product-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule, ProductCard],
  template: `
    @if (product(); as prod) {
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12">
        
        <!-- Boutique Breadcrumbs -->
        <nav class="flex items-center gap-2 text-xs text-[#535766] font-medium overflow-x-auto whitespace-nowrap">
          <a routerLink="/" class="hover:text-[#be185d] transition-colors">Home</a>
          <span aria-hidden="true" class="text-stone-300">/</span>
          <a routerLink="/shop" class="hover:text-[#be185d] transition-colors">Shop</a>
          <span aria-hidden="true" class="text-stone-300">/</span>
          <a
            [routerLink]="['/shop']"
            [queryParams]="{category: category()?.slug}"
            class="hover:text-[#be185d] transition-colors"
          >
            {{ category()?.name || 'Collection' }}
          </a>
          <span aria-hidden="true" class="text-stone-300">/</span>
          <span class="text-[#282c3f] font-semibold truncate max-w-xs">{{ prod.name }}</span>
        </nav>

        <!-- Main Product Section: Gallery Left + Boutique Info Right -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          <!-- Image Gallery Column (7 cols) -->
          <div class="lg:col-span-7 space-y-4">
            <!-- Large Primary Stage (3:4 ratio) -->
            <div class="relative aspect-3/4 bg-[#f8f8f9] rounded-2xl overflow-hidden border border-[#eaeaec] shadow-xs">
              <button
                type="button"
                class="w-full h-full block cursor-zoom-in text-left p-0 border-none bg-transparent"
                (click)="isLightboxOpen.set(true)"
                aria-label="Expand product image"
              >
                <img
                  [src]="activeImage()"
                  [alt]="prod.name"
                  class="w-full h-full object-cover object-top transition-all duration-300"
                  referrerpolicy="no-referrer"
                />
              </button>
              
              <!-- Zoom Button -->
              <button
                type="button"
                (click)="isLightboxOpen.set(true)"
                class="absolute bottom-3 right-3 p-2.5 bg-white/90 hover:bg-white text-[#282c3f] rounded-lg shadow-sm backdrop-blur-xs transition-colors cursor-pointer"
                title="View Full Resolution Image"
              >
                <mat-icon class="text-base">fullscreen</mat-icon>
              </button>

              <!-- Image Indicator -->
              <div class="absolute bottom-3 left-3 bg-white/90 text-[#282c3f] text-[11px] font-semibold px-2.5 py-1 rounded-md backdrop-blur-xs border border-white">
                {{ selectedImageIndex() + 1 }} / {{ prod.images.length || 1 }} Photos
              </div>
            </div>

            <!-- Thumbnails Strip -->
            @if (prod.images.length > 1) {
              <div class="flex items-center gap-3 overflow-x-auto pb-2">
                @for (img of prod.images; track img.id) {
                  <button
                    type="button"
                    (click)="selectedImageIndex.set($index)"
                    [class]="selectedImageIndex() === $index ? 'ring-2 ring-[#be185d] border-[#be185d]' : 'opacity-70 hover:opacity-100 border-[#eaeaec]'"
                    class="w-20 h-24 rounded-xl overflow-hidden bg-[#f8f8f9] shrink-0 border cursor-pointer transition-all"
                  >
                    <img
                      [src]="img.image_url"
                      [alt]="img.alt_text || prod.name"
                      class="w-full h-full object-cover object-top"
                      referrerpolicy="no-referrer"
                    />
                  </button>
                }
              </div>
            }
          </div>

          <!-- Product Information Column (5 cols) -->
          <div class="lg:col-span-5 space-y-6 lg:sticky lg:top-24 bg-white p-6 sm:p-8 border border-[#eaeaec] rounded-2xl shadow-xs">
            
            <!-- Brand & Product Title Header -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold tracking-widest text-[#be185d] uppercase text-[11px]">
                  {{ prod.brand || 'VIRAASAT COUTURE' }}
                </span>
                <span class="font-mono text-[11px] text-[#535766]">SKU: {{ prod.sku }}</span>
              </div>

              <h1 class="text-xl sm:text-2xl font-serif text-[#282c3f] leading-snug">
                {{ prod.name }}
              </h1>
            </div>

            <!-- Clean Price Display (Single Clean Price, No Discounts/MRP) -->
            <div class="pt-2 pb-3 border-y border-[#f5f5f6]">
              <div class="text-2xl sm:text-3xl font-bold text-[#282c3f] tabular-nums">
                {{ currency() }}{{ prod.price.toLocaleString() }}
              </div>
              <div class="text-xs text-[#535766] mt-1 font-medium">
                Pure handcrafted artisanal edition
              </div>
            </div>

            <!-- Available Colors -->
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs font-semibold">
                <span class="text-[#282c3f] uppercase tracking-wider">Color:</span>
                <span class="text-[#535766]">{{ selectedColor() }}</span>
              </div>
              <div class="flex items-center gap-2.5">
                @for (c of availableProductColors(); track c.name) {
                  <button
                    type="button"
                    (click)="selectedColor.set(c.name)"
                    [title]="c.name"
                    [class.ring-2]="selectedColor() === c.name"
                    [class.ring-[#be185d]]="selectedColor() === c.name"
                    class="w-7 h-7 rounded-full border border-black/10 transition-all cursor-pointer relative shadow-2xs"
                    [style.background-color]="c.hex"
                  ></button>
                }
              </div>
            </div>

            <!-- Available Sizes (Only Actual Sizes for this Product) -->
            @if (prod.sizes && prod.sizes.length > 0) {
              <div class="space-y-2">
                <div class="flex items-center justify-between text-xs font-semibold">
                  <span class="text-[#282c3f] uppercase tracking-wider">Select Size</span>
                  <button type="button" (click)="isSizeGuideOpen.set(true)" class="text-[#be185d] hover:underline cursor-pointer">
                    Size Guide
                  </button>
                </div>
                
                <div class="flex flex-wrap items-center gap-2">
                  @for (sz of prod.sizes; track sz) {
                    <button
                      type="button"
                      (click)="selectedSize.set(sz)"
                      [class]="selectedSize() === sz ? 'bg-[#be185d] text-white border-[#be185d]' : 'bg-white text-[#282c3f] border-[#eaeaec] hover:border-stone-400'"
                      class="min-w-11 h-10 px-3.5 rounded-lg text-xs font-semibold border flex items-center justify-center transition-all cursor-pointer"
                    >
                      {{ sz }}
                    </button>
                  }
                </div>
              </div>
            }

            <!-- Quantity Selector -->
            <div class="flex items-center gap-3">
              <span class="text-xs font-semibold uppercase text-[#282c3f]">Quantity:</span>
              <div class="inline-flex items-center border border-[#eaeaec] rounded-lg bg-[#fafafa] overflow-hidden">
                <button
                  type="button"
                  (click)="decreaseQty()"
                  class="px-3 py-1.5 text-stone-600 hover:bg-stone-200 transition-colors font-bold text-sm cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span class="px-3 py-1.5 text-xs font-bold tabular-nums text-[#282c3f]">
                  {{ selectedQuantity() }}
                </span>
                <button
                  type="button"
                  (click)="increaseQty()"
                  class="px-3 py-1.5 text-stone-600 hover:bg-stone-200 transition-colors font-bold text-sm cursor-pointer"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <!-- Primary CTAs: [ Add to Enquiry ] & [ WhatsApp ] -->
            <div class="space-y-3 pt-2">
              <button
                type="button"
                (click)="addToCart()"
                [disabled]="isOutOfStock()"
                class="w-full py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-white bg-[#be185d] hover:bg-[#9d174d] rounded-lg transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <mat-icon class="text-base">shopping_bag</mat-icon>
                <span>Add to Enquiry Bag</span>
              </button>

              <button
                type="button"
                (click)="orderOnWhatsApp()"
                class="w-full py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-white bg-[#25d366] hover:bg-[#20ba59] rounded-lg transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <mat-icon class="text-base">chat</mat-icon>
                <span>Send Enquiry on WhatsApp</span>
              </button>
            </div>

            <!-- Stock Availability Indicator -->
            <div class="pt-2 text-xs text-[#535766] flex items-center gap-1.5">
              @if (isOutOfStock()) {
                <span class="w-2 h-2 rounded-full bg-red-500"></span>
                <span class="text-red-700 font-semibold">Currently Out of Stock — WhatsApp for custom restock timeline</span>
              } @else {
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>In Stock — Handloom ready for dispatch with live video inspection</span>
              }
            </div>

          </div>
        </div>

        <!-- Clothing-Specific Product Specifications & Details -->
        <div class="border-t border-[#eaeaec] pt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          <!-- Left: Detailed Description -->
          <div class="lg:col-span-7 space-y-4">
            <h2 class="text-lg font-serif text-[#282c3f]">
              About This Garment
            </h2>
            <p class="text-xs sm:text-sm text-[#535766] leading-relaxed whitespace-pre-line">
              {{ prod.description }}
            </p>
          </div>

          <!-- Right: Clothing Attribute Table -->
          <div class="lg:col-span-5 space-y-4">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-[#282c3f]">
              Garment Information
            </h3>

            <div class="border border-[#eaeaec] rounded-xl overflow-hidden divide-y divide-[#f5f5f6] text-xs">
              <div class="grid grid-cols-3 p-3 bg-white">
                <span class="font-semibold text-[#282c3f]">Fabric</span>
                <span class="col-span-2 text-[#535766]">{{ prod.fabric || 'Pure Handloom' }}</span>
              </div>
              <div class="grid grid-cols-3 p-3 bg-[#fafafa]">
                <span class="font-semibold text-[#282c3f]">Color</span>
                <span class="col-span-2 text-[#535766]">{{ prod.color || 'Artisanal Shade' }}</span>
              </div>
              @if (prod.pattern) {
                <div class="grid grid-cols-3 p-3 bg-white">
                  <span class="font-semibold text-[#282c3f]">Pattern</span>
                  <span class="col-span-2 text-[#535766]">{{ prod.pattern }}</span>
                </div>
              }
              @if (prod.work) {
                <div class="grid grid-cols-3 p-3 bg-[#fafafa]">
                  <span class="font-semibold text-[#282c3f]">Work / Embroidery</span>
                  <span class="col-span-2 text-[#535766]">{{ prod.work }}</span>
                </div>
              }
              @if (prod.occasion) {
                <div class="grid grid-cols-3 p-3 bg-white">
                  <span class="font-semibold text-[#282c3f]">Occasion</span>
                  <span class="col-span-2 text-[#535766]">{{ prod.occasion }}</span>
                </div>
              }
              @if (prod.style) {
                <div class="grid grid-cols-3 p-3 bg-[#fafafa]">
                  <span class="font-semibold text-[#282c3f]">Style</span>
                  <span class="col-span-2 text-[#535766]">{{ prod.style }}</span>
                </div>
              }
              <div class="grid grid-cols-3 p-3 bg-white">
                <span class="font-semibold text-[#282c3f]">Care</span>
                <span class="col-span-2 text-[#535766]">{{ prod.wash_care || 'Dry Clean Recommended' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Related Products Section -->
        @if (relatedProducts().length > 0) {
          <div class="border-t border-[#eaeaec] pt-12 space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-serif text-[#282c3f]">
                More from this Collection
              </h2>
              <a
                [routerLink]="['/shop']"
                [queryParams]="{category: category()?.slug}"
                class="text-xs font-semibold text-[#be185d] hover:underline"
              >
                View Collection &rarr;
              </a>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              @for (rel of relatedProducts(); track rel.id) {
                <app-product-card [product]="rel"></app-product-card>
              }
            </div>
          </div>
        }

        <!-- Lightbox Modal for Full-Resolution Image -->
        @if (isLightboxOpen()) {
          <div class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <button
              type="button"
              (click)="isLightboxOpen.set(false)"
              class="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full cursor-pointer z-10"
              aria-label="Close image zoom"
            >
              <mat-icon class="text-2xl">close</mat-icon>
            </button>
            <div class="max-w-4xl max-h-[90vh] overflow-hidden rounded-xl">
              <img
                [src]="activeImage()"
                [alt]="prod.name"
                class="w-full h-full object-contain max-h-[85vh]"
                referrerpolicy="no-referrer"
              />
            </div>
          </div>
        }

        <!-- Size Guide Modal -->
        @if (isSizeGuideOpen()) {
          <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div class="bg-white max-w-lg w-full rounded-2xl p-6 space-y-4 border border-[#eaeaec] shadow-2xl">
              <div class="flex items-center justify-between border-b border-[#eaeaec] pb-3">
                <h3 class="text-base font-serif text-[#282c3f]">Standard Indian Size Guide (Inches)</h3>
                <button type="button" (click)="isSizeGuideOpen.set(false)" class="p-1 text-stone-500 cursor-pointer">
                  <mat-icon>close</mat-icon>
                </button>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-xs text-left">
                  <thead class="bg-[#fafafa] border-b border-[#eaeaec] text-[#282c3f] font-semibold">
                    <tr>
                      <th class="p-2.5">Size</th>
                      <th class="p-2.5">Bust</th>
                      <th class="p-2.5">Waist</th>
                      <th class="p-2.5">Hip</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#f5f5f6] text-[#535766]">
                    <tr><td class="p-2.5 font-bold text-[#282c3f]">XS</td><td class="p-2.5">34"</td><td class="p-2.5">28"</td><td class="p-2.5">36"</td></tr>
                    <tr><td class="p-2.5 font-bold text-[#282c3f]">S</td><td class="p-2.5">36"</td><td class="p-2.5">30"</td><td class="p-2.5">38"</td></tr>
                    <tr><td class="p-2.5 font-bold text-[#282c3f]">M</td><td class="p-2.5">38"</td><td class="p-2.5">32"</td><td class="p-2.5">40"</td></tr>
                    <tr><td class="p-2.5 font-bold text-[#282c3f]">L</td><td class="p-2.5">40"</td><td class="p-2.5">34"</td><td class="p-2.5">42"</td></tr>
                    <tr><td class="p-2.5 font-bold text-[#282c3f]">XL</td><td class="p-2.5">42"</td><td class="p-2.5">36"</td><td class="p-2.5">44"</td></tr>
                    <tr><td class="p-2.5 font-bold text-[#282c3f]">XXL</td><td class="p-2.5">44"</td><td class="p-2.5">38"</td><td class="p-2.5">46"</td></tr>
                  </tbody>
                </table>
              </div>

              <p class="text-[11px] text-[#535766] leading-relaxed pt-1">
                * Note: Blouses can be tailored to exact inch measurements. Simply mention your sizes when ordering via WhatsApp.
              </p>
            </div>
          </div>
        }

      </div>
    }
  `,
})
export class ProductDetail {
  private route = inject(ActivatedRoute);
  private catalogService = inject(CatalogService);
  private cartService = inject(CartService);

  slug = signal<string>('');
  selectedImageIndex = signal<number>(0);
  selectedQuantity = signal<number>(1);
  selectedSize = signal<ClothingSize | undefined>(undefined);
  selectedColor = signal<string>('');
  isLightboxOpen = signal<boolean>(false);
  isSizeGuideOpen = signal<boolean>(false);

  currency = computed(() => this.catalogService.settings().currency_symbol || '₹');

  product = computed<Product | undefined>(() => {
    const s = this.slug();
    return this.catalogService.products().find(p => p.slug === s || p.id === s);
  });

  category = computed(() => {
    const prod = this.product();
    if (!prod) return undefined;
    return this.catalogService.categories().find(c => c.id === prod.category_id);
  });

  isOutOfStock = computed(() => {
    const p = this.product();
    return !p || p.status === 'OUT_OF_STOCK' || p.stock_quantity <= 0;
  });

  activeImage = computed(() => {
    const prod = this.product();
    if (!prod || !prod.images || prod.images.length === 0) {
      return '';
    }
    const idx = this.selectedImageIndex();
    return prod.images[idx]?.image_url || prod.images[0]?.image_url;
  });

  availableProductColors = computed(() => {
    const p = this.product();
    if (!p) return [];
    const colors: { name: string; hex: string }[] = [];
    if (p.color) {
      colors.push({ name: p.color, hex: p.color_hex || '#940a43' });
    }
    if (p.available_colors) {
      p.available_colors.forEach(c => {
        if (!colors.some(existing => existing.name.toLowerCase() === c.name.toLowerCase())) {
          colors.push(c);
        }
      });
    }
    return colors;
  });

  relatedProducts = computed(() => {
    const current = this.product();
    if (!current) return [];
    return this.catalogService.activeProducts()
      .filter(p => p.id !== current.id && p.category_id === current.category_id)
      .slice(0, 4);
  });

  constructor() {
    this.route.paramMap.subscribe(params => {
      const s = params.get('slug');
      if (s) {
        this.slug.set(s);
        this.selectedImageIndex.set(0);
        this.selectedQuantity.set(1);
        const p = this.catalogService.products().find(item => item.slug === s || item.id === s);
        if (p) {
          if (p.sizes && p.sizes.length > 0) {
            this.selectedSize.set(p.sizes[0]);
          }
          if (p.color) {
            this.selectedColor.set(p.color);
          }
        }
      }
    });
  }

  increaseQty(): void {
    this.selectedQuantity.update(q => q + 1);
  }

  decreaseQty(): void {
    this.selectedQuantity.update(q => Math.max(1, q - 1));
  }

  addToCart(): void {
    const prod = this.product();
    if (!prod || this.isOutOfStock()) return;

    this.cartService.addItem(
      prod,
      this.selectedQuantity(),
      undefined,
      {
        selectedColor: this.selectedColor(),
        selectedSize: this.selectedSize(),
      }
    );
  }

  orderOnWhatsApp(): void {
    const prod = this.product();
    if (!prod) return;

    this.cartService.sendSingleProductEnquiry(
      prod,
      this.selectedQuantity(),
      '',
      {
        selectedColor: this.selectedColor(),
        selectedSize: this.selectedSize(),
      }
    );
  }
}
