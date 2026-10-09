import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {CatalogService} from '../../services/catalog.service';

@Component({
  selector: 'app-categories',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      <!-- Boutique Breadcrumbs -->
      <nav class="flex items-center gap-2 text-xs text-[#535766] font-medium">
        <a routerLink="/" class="hover:text-[#be185d] transition-colors">Home</a>
        <span aria-hidden="true" class="text-stone-300">/</span>
        <span class="text-[#282c3f] font-semibold">Categories & Silhouettes</span>
      </nav>

      <!-- Header -->
      <div class="space-y-2 border-b border-[#eaeaec] pb-6">
        <div class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#be185d]">
          <mat-icon class="text-sm">auto_awesome</mat-icon>
          <span>Curated Ethnic Wardrobe</span>
        </div>
        <h1 class="text-2xl sm:text-4xl font-serif text-[#282c3f] tracking-tight">
          Explore All Ethnic Categories
        </h1>
        <p class="text-xs sm:text-sm text-[#535766] leading-relaxed max-w-2xl">
          From royal Banarasi katan silks and bridal velvets to breezy Chikankari kurtas and kalidar Anarkalis, discover handpicked Indian craftsmanship ready for WhatsApp ordering.
        </p>
      </div>

      <!-- Categories Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        @for (cat of categories(); track cat.id) {
          <article class="group bg-white border border-[#eaeaec] rounded-2xl overflow-hidden shadow-2xs transition-all flex flex-col">
            <!-- Image Stage -->
            <a
              [routerLink]="['/shop']"
              [queryParams]="{category: cat.slug}"
              class="relative aspect-16/10 bg-[#fbf5f7] overflow-hidden block"
            >
              <img
                [src]="cat.image_url"
                [alt]="cat.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerpolicy="no-referrer"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              
              <!-- Badge -->
              <span class="absolute top-3 right-3 bg-[#be185d] text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-xs">
                {{ cat.count }} Pieces
              </span>

              <div class="absolute bottom-3 left-3 text-white">
                <span class="text-[10px] font-bold tracking-widest text-rose-200 uppercase block">Category</span>
                <span class="font-serif text-lg text-white leading-tight">{{ cat.name }}</span>
              </div>
            </a>

            <!-- Card Body -->
            <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <p class="text-xs text-[#535766] leading-relaxed line-clamp-2">
                  {{ cat.description }}
                </p>
              </div>

              <div class="pt-3 border-t border-[#f5f5f6] flex items-center justify-between">
                <span class="text-xs font-semibold text-[#03a685] flex items-center gap-1">
                  <mat-icon class="text-xs">verified</mat-icon>
                  <span>Ready for Dispatch</span>
                </span>

                <a
                  [routerLink]="['/shop']"
                  [queryParams]="{category: cat.slug}"
                  class="px-4 py-1.5 bg-[#fdf2f8] text-[#be185d] group-hover:bg-[#be185d] group-hover:text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                >
                  <span>View Styles</span>
                  <mat-icon class="text-sm">arrow_forward</mat-icon>
                </a>
              </div>
            </div>
          </article>
        }
      </div>

    </div>
  `,
})
export class Categories {
  private catalogService = inject(CatalogService);
  categories = this.catalogService.categoriesWithCounts;
}
