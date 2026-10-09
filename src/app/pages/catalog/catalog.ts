import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {CatalogService} from '../../services/catalog.service';
import {ClothingSize, OccasionType} from '../../models/catalog.model';
import {ProductCard} from '../../components/product-card/product-card';

@Component({
  selector: 'app-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule, ProductCard],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      
      <!-- Clean Boutique Breadcrumbs -->
      <nav class="flex items-center gap-2 text-xs text-[#535766] font-medium overflow-x-auto whitespace-nowrap">
        <a routerLink="/" class="hover:text-[#be185d] transition-colors">Home</a>
        <span aria-hidden="true" class="text-stone-300">/</span>
        <a routerLink="/shop" class="hover:text-[#be185d] transition-colors">Shop</a>
        @if (catalogService.selectedCategorySlug() !== 'all') {
          <span aria-hidden="true" class="text-stone-300">/</span>
          <span class="text-[#282c3f] font-semibold">{{ currentCategoryTitle() }}</span>
        }
        <span class="text-stone-400">({{ filteredList().length }} items)</span>
      </nav>

      <!-- Shop Top Header Strip -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eaeaec]">
        <div>
          <h1 class="text-2xl sm:text-3xl font-serif text-[#282c3f]">
            {{ currentCategoryTitle() }}
          </h1>
          <p class="text-xs text-[#535766] mt-0.5">
            Discover handcrafted Indian ethnic wear with custom sizing and direct WhatsApp enquiry
          </p>
        </div>

        <!-- Mobile Filter Button & Sort Bar -->
        <div class="flex items-center gap-3">
          <!-- Mobile Filters Trigger -->
          <button
            type="button"
            (click)="isMobileFiltersOpen.set(true)"
            class="lg:hidden inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#282c3f] bg-white border border-[#eaeaec] rounded-lg shadow-2xs cursor-pointer"
          >
            <mat-icon class="text-base text-[#be185d]">tune</mat-icon>
            <span>Filters</span>
            @if (activeFilterCount() > 0) {
              <span class="w-4 h-4 rounded-full bg-[#be185d] text-white text-[10px] flex items-center justify-center font-bold">
                {{ activeFilterCount() }}
              </span>
            }
          </button>

          <!-- Sort Select -->
          <div class="relative inline-flex items-center">
            <span class="hidden sm:inline text-xs text-[#535766] mr-2 font-medium">Sort:</span>
            <div class="relative">
              <select
                [value]="catalogService.sortBy()"
                (change)="onSortChange($any($event.target).value)"
                class="text-xs font-semibold bg-white border border-[#eaeaec] rounded-lg px-3 py-2 pr-8 text-[#282c3f] focus:outline-none focus:border-[#be185d] cursor-pointer appearance-none shadow-2xs"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
              <mat-icon class="text-stone-400 absolute right-2 top-2 text-base pointer-events-none">expand_more</mat-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Layout: Sidebar Filters + Products Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        <!-- Desktop Filters Sidebar -->
        <aside class="hidden lg:block space-y-6 bg-white p-5 border border-[#eaeaec] rounded-xl sticky top-28 shadow-2xs">
          <!-- Filters Header -->
          <div class="flex items-center justify-between border-b border-[#f5f5f6] pb-3">
            <div class="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-[#282c3f]">
              <mat-icon class="text-sm text-[#be185d]">filter_list</mat-icon>
              <span>Clothing Filters</span>
            </div>
            @if (activeFilterCount() > 0) {
              <button
                type="button"
                (click)="resetFilters()"
                class="text-xs font-semibold text-[#be185d] hover:underline cursor-pointer"
              >
                Clear All
              </button>
            }
          </div>

          <!-- Search Input Filter -->
          <div>
            <label for="catalog-search" class="block text-xs font-semibold uppercase tracking-wider text-[#282c3f] mb-2">Search Catalog</label>
            <div class="relative">
              <input
                id="catalog-search"
                type="text"
                placeholder="Search saree, zari, silk..."
                [value]="catalogService.searchQuery()"
                (input)="catalogService.searchQuery.set($any($event.target).value)"
                class="w-full text-xs pl-8 pr-3 py-2 bg-[#fafafa] focus:bg-white border border-[#eaeaec] focus:border-[#be185d] rounded-lg focus:outline-none text-[#282c3f]"
              />
              <mat-icon class="text-stone-400 text-sm absolute left-2.5 top-2.5">search</mat-icon>
            </div>
          </div>

          <!-- Categories Filter -->
          <div class="border-t border-[#f5f5f6] pt-4">
            <span class="block text-xs font-semibold uppercase tracking-wider text-[#282c3f] mb-2.5">Category</span>
            <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <button
                type="button"
                (click)="selectCategory('all')"
                [class]="catalogService.selectedCategorySlug() === 'all' ? 'text-[#be185d] font-bold' : 'text-[#535766] hover:text-[#282c3f]'"
                class="w-full text-left py-1 text-xs flex items-center justify-between cursor-pointer"
              >
                <span>All Indian Wear</span>
                <span class="text-[10px] text-stone-400">({{ totalActiveCount() }})</span>
              </button>

              @for (cat of categories(); track cat.id) {
                <button
                  type="button"
                  (click)="selectCategory(cat.slug)"
                  [class]="catalogService.selectedCategorySlug() === cat.slug ? 'text-[#be185d] font-bold' : 'text-[#535766] hover:text-[#282c3f]'"
                  class="w-full text-left py-1 text-xs flex items-center justify-between cursor-pointer"
                >
                  <span>{{ cat.name }}</span>
                  <span class="text-[10px] text-stone-400">({{ cat.count }})</span>
                </button>
              }
            </div>
          </div>

          <!-- Clothing Size Filter -->
          <div class="border-t border-[#f5f5f6] pt-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold uppercase tracking-wider text-[#282c3f]">Size</span>
              @if (catalogService.selectedSize() !== 'all') {
                <button type="button" (click)="catalogService.selectedSize.set('all')" class="text-[10px] text-[#be185d] hover:underline cursor-pointer">Reset</button>
              }
            </div>
            <div class="flex flex-wrap gap-1.5">
              @for (size of availableSizes; track size) {
                <button
                  type="button"
                  (click)="toggleSize(size)"
                  [class]="catalogService.selectedSize() === size ? 'bg-[#be185d] text-white border-[#be185d]' : 'bg-white text-[#282c3f] border-[#eaeaec] hover:border-stone-400'"
                  class="px-2.5 py-1 text-xs font-semibold rounded border transition-colors cursor-pointer"
                >
                  {{ size }}
                </button>
              }
            </div>
          </div>

          <!-- Clothing Color Filter (Swatches) -->
          <div class="border-t border-[#f5f5f6] pt-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold uppercase tracking-wider text-[#282c3f]">Color</span>
              @if (catalogService.selectedColor() !== 'all') {
                <button type="button" (click)="catalogService.selectedColor.set('all')" class="text-[10px] text-[#be185d] hover:underline cursor-pointer">Reset</button>
              }
            </div>
            <div class="flex flex-wrap gap-2">
              @for (c of availableColors(); track c.name) {
                <button
                  type="button"
                  (click)="toggleColor(c.name)"
                  [title]="c.name"
                  [class.ring-2]="catalogService.selectedColor() === c.name"
                  [class.ring-[#be185d]]="catalogService.selectedColor() === c.name"
                  class="w-6 h-6 rounded-full border border-black/10 transition-all cursor-pointer relative shadow-2xs"
                  [style.background-color]="c.hex"
                ></button>
              }
            </div>
          </div>

          <!-- Fabric Filter -->
          <div class="border-t border-[#f5f5f6] pt-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold uppercase tracking-wider text-[#282c3f]">Fabric</span>
              @if (catalogService.selectedFabric() !== 'all') {
                <button type="button" (click)="catalogService.selectedFabric.set('all')" class="text-[10px] text-[#be185d] hover:underline cursor-pointer">Reset</button>
              }
            </div>
            <div class="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              @for (fabric of availableFabrics(); track fabric) {
                <button
                  type="button"
                  (click)="toggleFabric(fabric)"
                  [class]="catalogService.selectedFabric() === fabric ? 'bg-[#be185d] text-white border-[#be185d]' : 'bg-[#fafafa] text-[#535766] border-[#eaeaec] hover:border-stone-400'"
                  class="px-2 py-0.5 text-[11px] font-medium rounded border transition-colors cursor-pointer"
                >
                  {{ fabric }}
                </button>
              }
            </div>
          </div>

          <!-- Occasion Filter -->
          <div class="border-t border-[#f5f5f6] pt-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold uppercase tracking-wider text-[#282c3f]">Occasion</span>
              @if (catalogService.selectedOccasion() !== 'all') {
                <button type="button" (click)="catalogService.selectedOccasion.set('all')" class="text-[10px] text-[#be185d] hover:underline cursor-pointer">Reset</button>
              }
            </div>
            <div class="flex flex-wrap gap-1.5">
              @for (occ of availableOccasions(); track occ) {
                <button
                  type="button"
                  (click)="toggleOccasion(occ)"
                  [class]="catalogService.selectedOccasion() === occ ? 'bg-[#be185d] text-white border-[#be185d]' : 'bg-[#fafafa] text-[#535766] border-[#eaeaec] hover:border-stone-400'"
                  class="px-2 py-0.5 text-[11px] font-medium rounded border transition-colors cursor-pointer"
                >
                  {{ occ }}
                </button>
              }
            </div>
          </div>

          <!-- Price Range Slider -->
          <div class="border-t border-[#f5f5f6] pt-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold uppercase tracking-wider text-[#282c3f]">Max Price</span>
              <span class="text-xs font-bold text-[#be185d] tabular-nums">
                {{ currency() }}{{ catalogService.maxPriceFilter().toLocaleString() }}
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="50000"
              step="500"
              [value]="catalogService.maxPriceFilter()"
              (input)="catalogService.maxPriceFilter.set(+$any($event.target).value)"
              class="w-full accent-[#be185d] cursor-pointer"
            />
            <div class="flex items-center justify-between text-[10px] text-stone-400 mt-1">
              <span>{{ currency() }}1,000</span>
              <span>{{ currency() }}50,000+</span>
            </div>
          </div>

          <!-- Availability Filter -->
          <div class="border-t border-[#f5f5f6] pt-4">
            <span class="block text-xs font-semibold uppercase tracking-wider text-[#282c3f] mb-2">Availability</span>
            <div class="flex gap-2">
              <button
                type="button"
                (click)="catalogService.selectedAvailability.set('all')"
                [class]="catalogService.selectedAvailability() === 'all' ? 'bg-[#be185d] text-white' : 'bg-[#fafafa] text-[#535766] border border-[#eaeaec]'"
                class="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                All
              </button>
              <button
                type="button"
                (click)="catalogService.selectedAvailability.set('in_stock')"
                [class]="catalogService.selectedAvailability() === 'in_stock' ? 'bg-[#be185d] text-white' : 'bg-[#fafafa] text-[#535766] border border-[#eaeaec]'"
                class="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                In Stock
              </button>
            </div>
          </div>
        </aside>

        <!-- Right: Products Grid -->
        <main class="lg:col-span-3 space-y-6">
          
          <!-- Active Filter Badges -->
          @if (activeFilterCount() > 0) {
            <div class="flex flex-wrap items-center gap-2 bg-[#fdf2f8] p-3 rounded-lg border border-[#fce7f3]">
              <span class="text-xs font-semibold text-[#be185d]">Active Filters:</span>
              
              @if (catalogService.selectedCategorySlug() !== 'all') {
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white border border-[#be185d] text-[#be185d] text-xs font-medium rounded-full">
                  <span>{{ currentCategoryTitle() }}</span>
                  <button type="button" (click)="selectCategory('all')" class="hover:text-red-700 cursor-pointer">✕</button>
                </span>
              }

              @if (catalogService.selectedSize() !== 'all') {
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white border border-[#be185d] text-[#be185d] text-xs font-medium rounded-full">
                  <span>Size: {{ catalogService.selectedSize() }}</span>
                  <button type="button" (click)="catalogService.selectedSize.set('all')" class="hover:text-red-700 cursor-pointer">✕</button>
                </span>
              }

              @if (catalogService.selectedColor() !== 'all') {
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white border border-[#be185d] text-[#be185d] text-xs font-medium rounded-full">
                  <span>Color: {{ catalogService.selectedColor() }}</span>
                  <button type="button" (click)="catalogService.selectedColor.set('all')" class="hover:text-red-700 cursor-pointer">✕</button>
                </span>
              }

              @if (catalogService.selectedFabric() !== 'all') {
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white border border-[#be185d] text-[#be185d] text-xs font-medium rounded-full">
                  <span>Fabric: {{ catalogService.selectedFabric() }}</span>
                  <button type="button" (click)="catalogService.selectedFabric.set('all')" class="hover:text-red-700 cursor-pointer">✕</button>
                </span>
              }

              @if (catalogService.selectedOccasion() !== 'all') {
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white border border-[#be185d] text-[#be185d] text-xs font-medium rounded-full">
                  <span>Occasion: {{ catalogService.selectedOccasion() }}</span>
                  <button type="button" (click)="catalogService.selectedOccasion.set('all')" class="hover:text-red-700 cursor-pointer">✕</button>
                </span>
              }

              @if (catalogService.searchQuery()) {
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white border border-[#be185d] text-[#be185d] text-xs font-medium rounded-full">
                  <span>"{{ catalogService.searchQuery() }}"</span>
                  <button type="button" (click)="catalogService.searchQuery.set('')" class="hover:text-red-700 cursor-pointer">✕</button>
                </span>
              }

              @if (catalogService.maxPriceFilter() < 50000) {
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white border border-[#be185d] text-[#be185d] text-xs font-medium rounded-full">
                  <span>&lt; {{ currency() }}{{ catalogService.maxPriceFilter() }}</span>
                  <button type="button" (click)="catalogService.maxPriceFilter.set(50000)" class="hover:text-red-700 cursor-pointer">✕</button>
                </span>
              }

              <button
                type="button"
                (click)="resetFilters()"
                class="text-xs font-semibold text-[#be185d] underline ml-auto cursor-pointer"
              >
                Clear All
              </button>
            </div>
          }

          <!-- Products Grid -->
          @if (paginatedProducts().length > 0) {
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              @for (product of paginatedProducts(); track product.id) {
                <app-product-card [product]="product"></app-product-card>
              }
            </div>

            <!-- Clean Pagination -->
            @if (totalPages() > 1) {
              <div class="pt-8 flex items-center justify-center gap-1.5 border-t border-[#eaeaec]">
                <button
                  type="button"
                  (click)="changePage(currentPage() - 1)"
                  [disabled]="currentPage() === 1"
                  class="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#eaeaec] bg-white text-[#282c3f] hover:bg-[#fafafa] disabled:opacity-30 cursor-pointer"
                >
                  Previous
                </button>

                @for (p of pageNumbers(); track p) {
                  <button
                    type="button"
                    (click)="changePage(p)"
                    [class]="currentPage() === p ? 'bg-[#be185d] text-white border-[#be185d]' : 'bg-white text-[#282c3f] border-[#eaeaec] hover:bg-[#fafafa]'"
                    class="w-8 h-8 rounded-lg text-xs font-semibold border transition-colors cursor-pointer"
                  >
                    {{ p }}
                  </button>
                }

                <button
                  type="button"
                  (click)="changePage(currentPage() + 1)"
                  [disabled]="currentPage() === totalPages()"
                  class="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#eaeaec] bg-white text-[#282c3f] hover:bg-[#fafafa] disabled:opacity-30 cursor-pointer"
                >
                  Next
                </button>
              </div>
            }
          } @else {
            <!-- Clean Empty State -->
            <div class="text-center py-16 bg-white border border-[#eaeaec] rounded-2xl p-8 space-y-4">
              <div class="w-16 h-16 rounded-full bg-[#fdf2f8] text-[#be185d] flex items-center justify-center mx-auto">
                <mat-icon class="text-3xl">checkroom</mat-icon>
              </div>
              <h3 class="text-lg font-serif text-[#282c3f]">No garments match your criteria</h3>
              <p class="text-xs text-[#535766] max-w-md mx-auto">
                Try selecting a different color, size, or fabric, or reset active filters to explore the full collection.
              </p>
              <button
                type="button"
                (click)="resetFilters()"
                class="px-5 py-2.5 bg-[#be185d] hover:bg-[#9d174d] text-white text-xs font-semibold uppercase rounded-lg shadow-2xs cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          }
        </main>
      </div>

      <!-- Mobile Filters Slide-over Drawer -->
      @if (isMobileFiltersOpen()) {
        <div class="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            aria-label="Close mobile filters overlay"
            class="fixed inset-0 bg-black/50 backdrop-blur-xs w-full h-full border-none cursor-default p-0"
            (click)="isMobileFiltersOpen.set(false)"
          ></button>
          <div class="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col p-6 overflow-y-auto space-y-5">
            <div class="flex items-center justify-between border-b border-[#eaeaec] pb-3">
              <span class="font-bold text-sm uppercase text-[#282c3f]">Filter Garments</span>
              <button type="button" (click)="isMobileFiltersOpen.set(false)" class="p-1 text-stone-500 cursor-pointer">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <!-- Categories -->
            <div>
              <span class="block text-xs font-semibold uppercase mb-2 text-[#282c3f]">Category</span>
              <div class="space-y-1">
                <button
                  type="button"
                  (click)="selectCategory('all')"
                  [class]="catalogService.selectedCategorySlug() === 'all' ? 'text-[#be185d] font-bold' : 'text-[#535766]'"
                  class="w-full text-left py-1 text-xs cursor-pointer"
                >
                  All Indian Wear
                </button>
                @for (cat of categories(); track cat.id) {
                  <button
                    type="button"
                    (click)="selectCategory(cat.slug)"
                    [class]="catalogService.selectedCategorySlug() === cat.slug ? 'text-[#be185d] font-bold' : 'text-[#535766]'"
                    class="w-full text-left py-1 text-xs cursor-pointer"
                  >
                    {{ cat.name }} ({{ cat.count }})
                  </button>
                }
              </div>
            </div>

            <!-- Size -->
            <div class="border-t border-[#eaeaec] pt-3">
              <span class="block text-xs font-semibold uppercase mb-2 text-[#282c3f]">Size</span>
              <div class="flex flex-wrap gap-1.5">
                @for (size of availableSizes; track size) {
                  <button
                    type="button"
                    (click)="toggleSize(size)"
                    [class]="catalogService.selectedSize() === size ? 'bg-[#be185d] text-white border-[#be185d]' : 'bg-white text-[#282c3f] border-[#eaeaec]'"
                    class="px-2.5 py-1 text-xs font-semibold rounded border"
                  >
                    {{ size }}
                  </button>
                }
              </div>
            </div>

            <div class="pt-4 border-t border-[#eaeaec] space-y-2">
              <button
                type="button"
                (click)="isMobileFiltersOpen.set(false)"
                class="w-full py-2.5 bg-[#be185d] text-white text-xs font-semibold uppercase rounded-lg cursor-pointer"
              >
                Apply Filters
              </button>
              <button
                type="button"
                (click)="resetFilters(); isMobileFiltersOpen.set(false)"
                class="w-full py-2 text-xs text-[#535766] cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
})
export class Catalog {
  catalogService = inject(CatalogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isMobileFiltersOpen = signal<boolean>(false);
  currentPage = signal<number>(1);
  itemsPerPage = 12;

  currency = computed(() => this.catalogService.settings().currency_symbol || '₹');
  categories = this.catalogService.categoriesWithCounts;
  filteredList = this.catalogService.filteredCatalog;
  totalActiveCount = computed(() => this.catalogService.activeProducts().length);

  availableSizes: ClothingSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'];
  availableColors = this.catalogService.availableColorsList;
  availableFabrics = this.catalogService.availableFabricsList;
  availableOccasions = this.catalogService.availableOccasionsList;

  currentCategoryTitle = computed(() => {
    const slug = this.catalogService.selectedCategorySlug();
    if (slug === 'all') return 'All Indian Ethnic Wear';
    const cat = this.catalogService.categories().find(c => c.slug === slug || c.id === slug);
    return cat ? cat.name : 'Ethnic Wear Collection';
  });

  activeFilterCount = computed(() => {
    let count = 0;
    if (this.catalogService.selectedCategorySlug() !== 'all') count++;
    if (this.catalogService.selectedSize() !== 'all') count++;
    if (this.catalogService.selectedColor() !== 'all') count++;
    if (this.catalogService.selectedFabric() !== 'all') count++;
    if (this.catalogService.selectedOccasion() !== 'all') count++;
    if (this.catalogService.selectedAvailability() !== 'all') count++;
    if (this.catalogService.searchQuery()) count++;
    if (this.catalogService.maxPriceFilter() < 50000) count++;
    return count;
  });

  totalPages = computed(() => {
    const total = this.filteredList().length;
    return Math.max(1, Math.ceil(total / this.itemsPerPage));
  });

  paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredList().slice(start, start + this.itemsPerPage);
  });

  pageNumbers = computed(() => {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages(); i++) {
      pages.push(i);
    }
    return pages;
  });

  constructor() {
    this.route.queryParams.subscribe((params) => {
      if (params['category']) {
        this.catalogService.selectedCategorySlug.set(params['category']);
      }
      if (params['search']) {
        this.catalogService.searchQuery.set(params['search']);
      }
      this.currentPage.set(1);
    });
  }

  selectCategory(slug: string): void {
    this.catalogService.selectedCategorySlug.set(slug);
    this.currentPage.set(1);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: slug === 'all' ? null : slug },
      queryParamsHandling: 'merge',
    });
  }

  toggleSize(size: ClothingSize): void {
    if (this.catalogService.selectedSize() === size) {
      this.catalogService.selectedSize.set('all');
    } else {
      this.catalogService.selectedSize.set(size);
    }
    this.currentPage.set(1);
  }

  toggleColor(colorName: string): void {
    if (this.catalogService.selectedColor() === colorName) {
      this.catalogService.selectedColor.set('all');
    } else {
      this.catalogService.selectedColor.set(colorName);
    }
    this.currentPage.set(1);
  }

  toggleFabric(fabric: string): void {
    if (this.catalogService.selectedFabric() === fabric) {
      this.catalogService.selectedFabric.set('all');
    } else {
      this.catalogService.selectedFabric.set(fabric);
    }
    this.currentPage.set(1);
  }

  toggleOccasion(occ: OccasionType): void {
    if (this.catalogService.selectedOccasion() === occ) {
      this.catalogService.selectedOccasion.set('all');
    } else {
      this.catalogService.selectedOccasion.set(occ);
    }
    this.currentPage.set(1);
  }

  onSortChange(value: string): void {
    this.catalogService.sortBy.set(value as 'newest' | 'price_asc' | 'price_desc' | 'name_asc');
    this.currentPage.set(1);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  resetFilters(): void {
    this.catalogService.selectedCategorySlug.set('all');
    this.catalogService.selectedSize.set('all');
    this.catalogService.selectedColor.set('all');
    this.catalogService.selectedFabric.set('all');
    this.catalogService.selectedOccasion.set('all');
    this.catalogService.selectedAvailability.set('all');
    this.catalogService.searchQuery.set('');
    this.catalogService.maxPriceFilter.set(50000);
    this.currentPage.set(1);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
  }
}
