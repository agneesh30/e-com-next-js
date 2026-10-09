import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {CatalogService} from '../../services/catalog.service';

@Component({
  selector: 'app-search-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4"
        aria-modal="true"
        role="dialog"
        tabindex="-1"
        (keydown.escape)="close()"
      >
        <!-- Accessible Backdrop Button -->
        <button
          type="button"
          class="fixed inset-0 w-full h-full bg-black/60 backdrop-blur-xs border-none cursor-default p-0"
          (click)="close()"
          aria-label="Close search overlay"
        ></button>

        <div
          class="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#eaeaec] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          <!-- Search Input Header -->
          <div class="p-4 sm:p-5 border-b border-[#eaeaec] flex items-center gap-3 bg-white">
            <mat-icon class="text-[#be185d] text-2xl">search</mat-icon>
            <input
              type="text"
              placeholder="Search for sarees, lehengas, kurtas, banarasi, silk..."
              [value]="query()"
              (input)="query.set($any($event.target).value)"
              class="w-full text-base sm:text-lg bg-transparent border-none focus:outline-none text-[#282c3f] placeholder:text-[#94969f] font-semibold"
            />
            @if (query()) {
              <button
                type="button"
                (click)="query.set('')"
                class="text-xs text-[#94969f] hover:text-[#be185d] px-2 py-1 rounded cursor-pointer font-bold"
              >
                Clear
              </button>
            }
            <button
              type="button"
              (click)="close()"
              class="p-1.5 text-stone-400 hover:text-[#282c3f] rounded-lg hover:bg-[#f5f5f6] transition-colors cursor-pointer"
            >
              <mat-icon class="text-xl">close</mat-icon>
            </button>
          </div>

          <!-- Quick Category Filters -->
          <div class="px-5 py-2.5 bg-[#fafafa] border-b border-[#eaeaec] flex items-center gap-2 overflow-x-auto text-xs">
            <span class="text-[#535766] font-bold uppercase text-[10px] whitespace-nowrap">Popular:</span>
            <button
              type="button"
              (click)="query.set('Banarasi')"
              class="px-2.5 py-1 bg-white border border-[#eaeaec] hover:border-[#be185d] hover:text-[#be185d] rounded-full text-[#282c3f] font-semibold transition-colors whitespace-nowrap cursor-pointer shadow-xs"
            >
              Banarasi Silk
            </button>
            <button
              type="button"
              (click)="query.set('Lehenga')"
              class="px-2.5 py-1 bg-white border border-[#eaeaec] hover:border-[#be185d] hover:text-[#be185d] rounded-full text-[#282c3f] font-semibold transition-colors whitespace-nowrap cursor-pointer shadow-xs"
            >
              Lehengas
            </button>
            <button
              type="button"
              (click)="query.set('Kurta')"
              class="px-2.5 py-1 bg-white border border-[#eaeaec] hover:border-[#be185d] hover:text-[#be185d] rounded-full text-[#282c3f] font-semibold transition-colors whitespace-nowrap cursor-pointer shadow-xs"
            >
              Kurta Sets
            </button>
            <button
              type="button"
              (click)="query.set('Anarkali')"
              class="px-2.5 py-1 bg-white border border-[#eaeaec] hover:border-[#be185d] hover:text-[#be185d] rounded-full text-[#282c3f] font-semibold transition-colors whitespace-nowrap cursor-pointer shadow-xs"
            >
              Anarkali
            </button>
            <button
              type="button"
              (click)="query.set('Wedding')"
              class="px-2.5 py-1 bg-white border border-[#eaeaec] hover:border-[#be185d] hover:text-[#be185d] rounded-full text-[#282c3f] font-semibold transition-colors whitespace-nowrap cursor-pointer shadow-xs"
            >
              Wedding Edit
            </button>
          </div>

          <!-- Results List -->
          <div class="max-h-[60vh] overflow-y-auto p-4 sm:p-5">
            @if (results().length === 0) {
              <div class="py-12 text-center text-[#535766]">
                <mat-icon class="text-3xl text-stone-300 mb-2">search_off</mat-icon>
                <p class="text-sm font-bold text-[#282c3f]">No styles found matching "{{ query() }}"</p>
                <p class="text-xs text-[#94969f] mt-1">Try searching by fabric like "Georgette", "Silk", or category.</p>
              </div>
            } @else {
              <div class="space-y-2">
                @for (prod of results(); track prod.id) {
                  <a
                    [routerLink]="['/product', prod.slug]"
                    (click)="close()"
                    class="flex items-center gap-3.5 p-2 rounded-xl hover:bg-[#fdf2f8] border border-transparent hover:border-[#be185d]/20 transition-all group cursor-pointer"
                  >
                    <div class="w-14 h-16 rounded-lg bg-[#fbf5f7] overflow-hidden shrink-0 border border-[#eaeaec]">
                      <img
                        [src]="prod.images[0]?.image_url"
                        [alt]="prod.name"
                        class="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                        referrerpolicy="no-referrer"
                      />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 text-[11px] font-bold text-[#be185d]">
                        <span class="uppercase">{{ prod.brand || 'VIRAASAT' }}</span>
                        <span aria-hidden="true" class="text-stone-300">·</span>
                        <span class="text-[#7e818c] font-normal uppercase">{{ prod.sku }}</span>
                      </div>
                      <h4 class="text-xs sm:text-sm font-bold text-[#282c3f] group-hover:text-[#be185d] truncate">
                        {{ prod.name }}
                      </h4>
                      <p class="text-[11px] text-[#535766] truncate mt-0.5">
                        {{ prod.fabric }} · {{ prod.occasion }}
                      </p>
                    </div>
                    <div class="text-right shrink-0">
                      <div class="text-xs sm:text-sm font-bold text-[#282c3f] tabular-nums">
                        {{ currency() }}{{ prod.price.toLocaleString() }}
                      </div>
                    </div>
                  </a>
                }
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class SearchModal {
  private catalogService = inject(CatalogService);

  isOpen = signal<boolean>(false);
  query = signal<string>('');

  currency = computed(() => this.catalogService.settings().currency_symbol || '₹');

  results = computed(() => {
    const q = this.query().toLowerCase().trim();
    const products = this.catalogService.activeProducts();
    if (!q) return products.slice(0, 6);
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.fabric && p.fabric.toLowerCase().includes(q)) ||
      (p.occasion && p.occasion.toLowerCase().includes(q)) ||
      p.short_description.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    ).slice(0, 10);
  });

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('open-search-modal', () => {
        this.isOpen.set(true);
      });
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen()) {
          this.close();
        }
      });
    }
  }

  close(): void {
    this.isOpen.set(false);
    this.query.set('');
  }
}
