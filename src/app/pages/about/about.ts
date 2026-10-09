import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {CatalogService} from '../../services/catalog.service';

@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-12">
      
      <!-- Myntra Breadcrumbs -->
      <nav class="flex items-center gap-2 text-xs text-[#535766] font-medium">
        <a routerLink="/" class="hover:text-[#ff3f6c] transition-colors">Home</a>
        <span aria-hidden="true" class="text-stone-300">/</span>
        <span class="text-[#282c3f] font-bold">Our Weaving Heritage</span>
      </nav>

      <!-- Story Header -->
      <div class="max-w-3xl space-y-3 border-b border-[#eaeaec] pb-6">
        <div class="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#ff3f6c]">
          <mat-icon class="text-sm">auto_awesome</mat-icon>
          <span>The Viraasat Legacy</span>
        </div>
        <h1 class="text-2xl sm:text-4xl font-black text-[#282c3f] tracking-tight uppercase">
          Celebrating 4 Decades of Indian Craft & Handloom
        </h1>
        <p class="text-xs sm:text-sm text-[#535766] leading-relaxed">
          {{ settings().about }}
        </p>
      </div>

      <!-- 3 Pillar Values with Vibrant Pink / Green / Orange Badges -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-6 bg-white border border-[#eaeaec] rounded-2xl space-y-3 myntra-card-shadow">
          <div class="w-12 h-12 rounded-xl bg-[#fff0f5] text-[#ff3f6c] flex items-center justify-center">
            <mat-icon class="text-2xl">workspace_premium</mat-icon>
          </div>
          <h3 class="text-base font-black uppercase text-[#282c3f]">01. Master Weavers</h3>
          <p class="text-xs text-[#535766] leading-relaxed">
            Every Banarasi katan silk, Chanderi tissue, and Bandhani drape is created directly with multi-generational weaver clusters across Varanasi, Jaipur, and Surat.
          </p>
        </div>

        <div class="p-6 bg-white border border-[#eaeaec] rounded-2xl space-y-3 myntra-card-shadow">
          <div class="w-12 h-12 rounded-xl bg-[#ecfdf5] text-[#03a685] flex items-center justify-center">
            <mat-icon class="text-2xl">cut</mat-icon>
          </div>
          <h3 class="text-base font-black uppercase text-[#282c3f]">02. Hand Embroidery</h3>
          <p class="text-xs text-[#535766] leading-relaxed">
            Our bridal lehengas and Anarkalis showcase authentic Zardozi metallic needlework, gota patti appliqués, Lucknowi Chikankari, and mirror work.
          </p>
        </div>

        <div class="p-6 bg-white border border-[#eaeaec] rounded-2xl space-y-3 myntra-card-shadow">
          <div class="w-12 h-12 rounded-xl bg-[#fff6ed] text-[#ff6a00] flex items-center justify-center">
            <mat-icon class="text-2xl">chat</mat-icon>
          </div>
          <h3 class="text-base font-black uppercase text-[#282c3f]">03. WhatsApp Concierge</h3>
          <p class="text-xs text-[#535766] leading-relaxed">
            Get personalized blouse stitching measurements, video calls to inspect silk drape before dispatch, and seamless direct ordering without account logins.
          </p>
        </div>
      </div>

      <!-- Vibrant Workshop Gallery Showcase -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-gradient-to-br from-[#fff0f5] to-[#ffeef2] p-8 sm:p-12 rounded-3xl border border-pink-200">
        <div class="space-y-4">
          <span class="text-xs font-black uppercase tracking-wider text-[#ff3f6c]">Direct Artisan Model</span>
          <h2 class="text-2xl sm:text-3xl font-black text-[#282c3f] tracking-tight uppercase">
            Luxury Indian Wear without Marketplace Markups
          </h2>
          <p class="text-xs sm:text-sm text-[#535766] leading-relaxed">
            By connecting you directly to our design atelier and weavers via WhatsApp, we eliminate third-party commission markups, passing 40% - 60% savings directly to you with complete transparency.
          </p>
          <div class="pt-2">
            <a
              routerLink="/products"
              class="inline-flex items-center gap-2 px-6 py-3 bg-[#ff3f6c] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md hover:bg-[#e0325d] transition-all"
            >
              <span>Explore Collection</span>
              <mat-icon class="text-sm">arrow_forward</mat-icon>
            </a>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="rounded-xl overflow-hidden aspect-3/4 shadow-md">
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80"
              alt="Banarasi Handloom Weaving"
              class="w-full h-full object-cover"
              referrerpolicy="no-referrer"
            />
          </div>
          <div class="rounded-xl overflow-hidden aspect-3/4 shadow-md translate-y-4">
            <img
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80"
              alt="Lehenga Zari Embroidery"
              class="w-full h-full object-cover"
              referrerpolicy="no-referrer"
            />
          </div>
        </div>
      </div>

    </div>
  `,
})
export class About {
  private catalogService = inject(CatalogService);
  settings = this.catalogService.settings;
}
