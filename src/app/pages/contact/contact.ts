import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {CatalogService} from '../../services/catalog.service';

@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-10">
      
      <!-- Myntra Breadcrumbs -->
      <nav class="flex items-center gap-2 text-xs text-[#535766] font-medium">
        <a routerLink="/" class="hover:text-[#ff3f6c] transition-colors">Home</a>
        <span aria-hidden="true" class="text-stone-300">/</span>
        <span class="text-[#282c3f] font-bold">Contact & WhatsApp Concierge</span>
      </nav>

      <!-- Header -->
      <div class="max-w-2xl space-y-2 border-b border-[#eaeaec] pb-6">
        <div class="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#ff3f6c]">
          <mat-icon class="text-sm">support_agent</mat-icon>
          <span>Direct Stylist Assistance</span>
        </div>
        <h1 class="text-2xl sm:text-4xl font-black text-[#282c3f] tracking-tight uppercase">
          Connect with Viraasat Couture
        </h1>
        <p class="text-xs sm:text-sm text-[#535766] leading-relaxed">
          Need custom blouse stitching, sizing confirmation, video call fabric inspection, or wedding trousseau consultation? Our team is live on WhatsApp daily.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        
        <!-- Direct Channels (7 cols) -->
        <div class="lg:col-span-7 space-y-6">
          
          <!-- Primary WhatsApp Quick Connect Card -->
          <div class="p-6 sm:p-8 bg-gradient-to-br from-[#ecfdf5] to-[#d1fae5] border border-emerald-300 rounded-2xl space-y-4 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-[#25d366] text-white flex items-center justify-center shadow-md">
                <mat-icon class="text-2xl">chat</mat-icon>
              </div>
              <div>
                <h3 class="text-base font-black text-[#064e3b]">WhatsApp Concierge (Instant Response)</h3>
                <p class="text-xs text-[#047857] font-semibold">Typical reply time: Under 10 minutes</p>
              </div>
            </div>

            <p class="text-xs text-[#065f46] leading-relaxed">
              Send us any catalog product screenshot or SKU, request HD photos under natural lighting, or send your tailor measurements for custom stitching.
            </p>

            <button
              type="button"
              (click)="openWhatsApp()"
              class="w-full sm:w-auto px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white bg-[#25d366] hover:bg-[#20ba59] rounded-xl transition-all shadow-md active:scale-98 cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <mat-icon class="text-base">chat</mat-icon>
              <span>Chat with Stylist on {{ settings().phone }}</span>
            </button>
          </div>

          <!-- Contact Details Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-5 bg-white border border-[#eaeaec] rounded-xl space-y-1.5 shadow-xs">
              <div class="text-[11px] font-black uppercase tracking-wider text-[#ff3f6c] flex items-center gap-1.5">
                <mat-icon class="text-sm">call</mat-icon>
                <span>Direct Hotline</span>
              </div>
              <p class="text-sm font-bold text-[#282c3f]">{{ settings().phone }}</p>
              <p class="text-[11px] text-[#535766]">Available Mon – Sun, 10 AM to 8 PM</p>
            </div>

            <div class="p-5 bg-white border border-[#eaeaec] rounded-xl space-y-1.5 shadow-xs">
              <div class="text-[11px] font-black uppercase tracking-wider text-[#ff3f6c] flex items-center gap-1.5">
                <mat-icon class="text-sm">mail</mat-icon>
                <span>Customer Care Email</span>
              </div>
              <p class="text-sm font-bold text-[#282c3f]">{{ settings().email }}</p>
              <p class="text-[11px] text-[#535766]">Order queries & bulk wedding gifting</p>
            </div>

            <div class="p-5 bg-white border border-[#eaeaec] rounded-xl space-y-1.5 shadow-xs">
              <div class="text-[11px] font-black uppercase tracking-wider text-[#ff3f6c] flex items-center gap-1.5">
                <mat-icon class="text-sm">storefront</mat-icon>
                <span>Boutique Flagship</span>
              </div>
              <p class="text-xs font-semibold text-[#282c3f] leading-snug">{{ settings().address }}</p>
              <p class="text-[11px] text-[#535766]">{{ settings().city }}</p>
            </div>

            <div class="p-5 bg-white border border-[#eaeaec] rounded-xl space-y-1.5 shadow-xs">
              <div class="text-[11px] font-black uppercase tracking-wider text-[#ff3f6c] flex items-center gap-1.5">
                <mat-icon class="text-sm">schedule</mat-icon>
                <span>Visiting Hours</span>
              </div>
              <p class="text-xs font-semibold text-[#282c3f]">{{ settings().business_hours }}</p>
              <p class="text-[11px] text-[#03a685] font-bold">Open all 7 days</p>
            </div>
          </div>
        </div>

        <!-- Google Maps & Boutique Highlights (5 cols) -->
        <div class="lg:col-span-5 space-y-6">
          <div class="p-6 bg-white border border-[#eaeaec] rounded-2xl space-y-4 shadow-xs">
            <h3 class="text-sm font-black uppercase tracking-wider text-[#282c3f]">
              Visit Our Styling Studio
            </h3>
            <p class="text-xs text-[#535766] leading-relaxed">
              Experience the tactile weight of pure Banarasi silks, try on designer lehengas, and meet with master embroiderers.
            </p>

            @if (settings().google_maps_url) {
              <a
                [href]="settings().google_maps_url"
                target="_blank"
                rel="noopener noreferrer"
                class="block w-full py-3 text-center text-xs font-bold uppercase tracking-wider text-[#ff3f6c] bg-[#fff0f5] hover:bg-[#ff3f6c] hover:text-white border border-[#ff3f6c] rounded-xl transition-all"
              >
                Open Studio in Google Maps
              </a>
            }

            <div class="pt-4 border-t border-[#f5f5f6] space-y-2 text-xs text-[#535766]">
              <div class="flex items-center gap-2">
                <mat-icon class="text-sm text-[#03a685]">check_circle</mat-icon>
                <span>Free dedicated customer parking</span>
              </div>
              <div class="flex items-center gap-2">
                <mat-icon class="text-sm text-[#03a685]">check_circle</mat-icon>
                <span>In-house tailor for instant measurements</span>
              </div>
              <div class="flex items-center gap-2">
                <mat-icon class="text-sm text-[#03a685]">check_circle</mat-icon>
                <span>Complimentary masala chai & styling</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  `,
})
export class Contact {
  private catalogService = inject(CatalogService);
  settings = this.catalogService.settings;

  openWhatsApp(): void {
    const s = this.settings();
    const raw = s.whatsapp_number.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hello ${s.business_name}, I would like styling assistance and to enquire about your ethnic wear catalog.`);
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
