import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {CatalogService} from '../../services/catalog.service';
import {ProductCard} from '../../components/product-card/product-card';
import {FashionCollection} from '../../models/catalog.model';

@Component({
  selector: 'app-collections',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule, ProductCard],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 sm:space-y-16">
      
      <!-- Boutique Breadcrumbs -->
      <nav class="flex items-center gap-2 text-xs text-[#535766] font-medium overflow-x-auto whitespace-nowrap">
        <a routerLink="/" class="hover:text-[#be185d] transition-colors">Home</a>
        <span aria-hidden="true" class="text-stone-300">/</span>
        <span class="text-[#282c3f] font-semibold">Collections</span>
      </nav>

      <!-- Collections Page Header Banner -->
      <div class="bg-white border border-[#eaeaec] rounded-2xl p-6 sm:p-10 lg:p-12 shadow-2xs">
        <div class="max-w-3xl space-y-4">
          <span class="inline-block text-[11px] font-bold tracking-[0.25em] text-[#be185d] uppercase">
            Curated Wardrobe Edits
          </span>
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#282c3f] leading-tight">
            Thematic Indian Couture Collections
          </h1>
          <p class="text-xs sm:text-sm text-[#535766] leading-relaxed">
            Each Viraasat collection is a thoughtfully curated narrative—from time-honored Banarasi silks and royal bridal heirlooms to breathable everyday Mulmul kurtas. Browse the signature series below and connect with our boutique stylist via WhatsApp.
          </p>

          <!-- Quick Collection Switcher Pills -->
          <div class="pt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              (click)="selectedCollectionSlug.set('all')"
              [class]="selectedCollectionSlug() === 'all' ? 'bg-[#be185d] text-white border-[#be185d]' : 'bg-[#fafafa] text-[#282c3f] border-[#eaeaec] hover:border-stone-400'"
              class="px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer"
            >
              All Collections
            </button>
            @for (col of collections(); track col.id) {
              <button
                type="button"
                (click)="selectedCollectionSlug.set(col.slug)"
                [class]="selectedCollectionSlug() === col.slug ? 'bg-[#be185d] text-white border-[#be185d]' : 'bg-[#fafafa] text-[#282c3f] border-[#eaeaec] hover:border-stone-400'"
                class="px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer"
              >
                {{ col.name }}
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Curated Collection Sections -->
      <div class="space-y-14 sm:space-y-20">
        @for (col of filteredCollections(); track col.id) {
          <section class="space-y-6">
            
            <!-- Collection Editorial Banner Card -->
            <div class="relative bg-white border border-[#eaeaec] rounded-2xl overflow-hidden shadow-2xs grid grid-cols-1 md:grid-cols-12 items-center">
              <!-- Banner Image (5 cols) -->
              <div class="md:col-span-5 h-56 sm:h-72 md:h-80 overflow-hidden relative bg-[#f8f8f9]">
                <img
                  [src]="col.image_url"
                  [alt]="col.name"
                  class="w-full h-full object-cover object-top hover:scale-102 transition-transform duration-700 ease-out"
                  referrerpolicy="no-referrer"
                />
                @if (col.badge_label) {
                  <span class="absolute top-4 left-4 bg-[#be185d] text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md shadow-xs">
                    {{ col.badge_label }}
                  </span>
                }
              </div>

              <!-- Banner Description & CTAs (7 cols) -->
              <div class="md:col-span-7 p-6 sm:p-8 lg:p-10 space-y-4">
                <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#be185d]">
                  Signature Collection
                </span>
                <h2 class="text-2xl sm:text-3xl font-serif text-[#282c3f]">
                  {{ col.name }}
                </h2>
                <p class="text-xs sm:text-sm text-[#535766] leading-relaxed max-w-xl">
                  {{ col.description }}
                </p>

                <div class="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    [routerLink]="['/shop']"
                    [queryParams]="{category: 'all'}"
                    class="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#be185d] hover:bg-[#9d174d] rounded-lg transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Browse Collection</span>
                    <mat-icon class="text-sm">arrow_forward</mat-icon>
                  </a>

                  <button
                    type="button"
                    (click)="enquireCollectionWhatsApp(col)"
                    class="px-5 py-2.5 text-xs font-semibold tracking-wider uppercase text-[#25d366] hover:bg-[#25d366]/10 border border-[#25d366]/40 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <mat-icon class="text-sm">chat</mat-icon>
                    <span>Enquire on WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Curated Products in This Collection -->
            @if (col.products.length > 0) {
              <div>
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-xs font-bold uppercase tracking-wider text-[#535766]">
                    Curated Pieces in {{ col.name }}
                  </h3>
                  <a
                    [routerLink]="['/shop']"
                    class="text-xs font-semibold text-[#be185d] hover:underline"
                  >
                    View All in Shop &rarr;
                  </a>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  @for (prod of col.products.slice(0, 4); track prod.id) {
                    <app-product-card [product]="prod"></app-product-card>
                  }
                </div>
              </div>
            }

          </section>
        }
      </div>

      <!-- Bottom WhatsApp Concierge Banner -->
      <section class="bg-white border border-[#eaeaec] rounded-2xl p-6 sm:p-10 text-center space-y-4 shadow-2xs">
        <h3 class="font-serif text-xl sm:text-2xl text-[#282c3f]">
          Looking for a Bespoke Silhouette or Specific Weave?
        </h3>
        <p class="text-xs sm:text-sm text-[#535766] max-w-xl mx-auto leading-relaxed">
          Our in-house master stylists and weavers can assist you directly over WhatsApp with real-time video draping, custom blouse styling, and fabric swatches.
        </p>
        <div>
          <button
            type="button"
            (click)="openDirectWhatsApp()"
            class="px-6 py-3 text-xs font-bold uppercase tracking-wider text-white bg-[#25d366] hover:bg-[#20ba59] rounded-lg transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <mat-icon class="text-base">chat</mat-icon>
            <span>Connect with Boutique Stylist</span>
          </button>
        </div>
      </section>

    </div>
  `,
})
export class Collections {
  private catalogService = inject(CatalogService);

  selectedCollectionSlug = signal<string>('all');

  collections = this.catalogService.collectionsWithProducts;

  filteredCollections = computed(() => {
    const slug = this.selectedCollectionSlug();
    const all = this.collections();
    if (slug === 'all') return all;
    return all.filter(c => c.slug === slug);
  });

  enquireCollectionWhatsApp(col: FashionCollection): void {
    const settings = this.catalogService.settings();
    const rawNumber = settings.whatsapp_number.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hello ${settings.business_name}, I am browsing your "${col.name}" collection on your website and would like to see available pieces and enquire about ordering.`);
    const url = `https://wa.me/${rawNumber}?text=${message}`;

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

  openDirectWhatsApp(): void {
    const settings = this.catalogService.settings();
    const rawNumber = settings.whatsapp_number.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hello ${settings.business_name}, I would like assistance with your Indian ethnic wear collections.`);
    const url = `https://wa.me/${rawNumber}?text=${message}`;

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
