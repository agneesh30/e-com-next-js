import {ChangeDetectionStrategy, Component, computed, inject, input, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {Product} from '../../models/catalog.model';
import {CatalogService} from '../../services/catalog.service';

@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  template: `
    <article class="boutique-card group flex flex-col bg-white border border-[#eaeaec] rounded-xl overflow-hidden">
      <!-- 3:4 Portrait Product Image -->
      <a [routerLink]="['/product', product().slug]" class="block relative aspect-3/4 bg-[#f8f8f9] overflow-hidden cursor-pointer">
        @if (primaryImageUrl()) {
          <img
            [src]="primaryImageUrl()"
            [alt]="product().name"
            referrerpolicy="no-referrer"
            (error)="handleImageError()"
            class="w-full h-full object-cover object-top group-hover:scale-102 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        } @else {
          <div class="w-full h-full flex flex-col items-center justify-center bg-[#fdf2f8] text-[#be185d] p-6 text-center">
            <mat-icon class="text-3xl text-[#be185d]/40 mb-1">checkroom</mat-icon>
            <span class="text-xs font-semibold text-[#be185d]">{{ categoryName() }}</span>
          </div>
        }

        <!-- Clean Availability Badge if Out of Stock -->
        @if (isOutOfStock()) {
          <div class="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
            Out of Stock
          </div>
        }
      </a>

      <!-- Clean Card Body (Product Name, Price, Attribute) -->
      <div class="p-3.5 sm:p-4 flex flex-col flex-1 justify-between bg-white space-y-2">
        <div class="space-y-1">
          <!-- Product Title -->
          <h3 class="text-xs sm:text-sm font-semibold text-[#282c3f] group-hover:text-[#be185d] transition-colors line-clamp-1">
            <a [routerLink]="['/product', product().slug]">
              {{ product().name }}
            </a>
          </h3>

          <!-- Short Attribute (e.g. Silk • Maroon) -->
          <p class="text-[11px] text-[#535766] truncate font-medium">
            {{ attributeSummary() }}
          </p>
        </div>

        <!-- Clean Price (No MRP strikethrough, No % OFF) -->
        <div class="pt-1.5 border-t border-[#f5f5f6] flex items-center justify-between">
          <span class="text-sm sm:text-base font-bold text-[#282c3f] tabular-nums">
            {{ currencySymbol() }}{{ product().price.toLocaleString() }}
          </span>
          @if (!isOutOfStock()) {
            <span class="text-[11px] text-[#535766] group-hover:text-[#be185d] font-medium transition-colors">
              View &rarr;
            </span>
          }
        </div>
      </div>
    </article>
  `,
})
export class ProductCard {
  private catalogService = inject(CatalogService);

  product = input.required<Product>();
  private imageError = signal<boolean>(false);

  currencySymbol = computed(() => this.catalogService.settings().currency_symbol || '₹');

  categoryName = computed(() => {
    const cat = this.catalogService.categories().find(c => c.id === this.product().category_id);
    return cat ? cat.name : 'Ethnic Wear';
  });

  isOutOfStock = computed(() => {
    const p = this.product();
    return p.status === 'OUT_OF_STOCK' || p.stock_quantity <= 0;
  });

  attributeSummary = computed(() => {
    const p = this.product();
    const parts: string[] = [];
    if (p.fabric) parts.push(p.fabric);
    if (p.color) parts.push(p.color);
    if (parts.length === 0 && p.occasion) parts.push(p.occasion);
    return parts.length > 0 ? parts.join(' • ') : this.categoryName();
  });

  primaryImageUrl = computed(() => {
    if (this.imageError()) {
      return '';
    }
    const p = this.product();
    if (p.images && p.images.length > 0) {
      const primary = p.images.find(img => img.is_primary);
      return primary ? primary.image_url : p.images[0].image_url;
    }
    return '';
  });

  handleImageError(): void {
    this.imageError.set(true);
  }
}
