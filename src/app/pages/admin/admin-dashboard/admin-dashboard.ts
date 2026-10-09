import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {MatIconModule} from '@angular/material/icon';
import {AuthService} from '../../../services/auth.service';
import {CatalogService} from '../../../services/catalog.service';
import {NotificationService} from '../../../services/notification.service';
import {BusinessSettings, Category, EnquiryLog, Product, ProductStatus} from '../../../models/catalog.model';

type AdminTab = 'overview' | 'products' | 'categories' | 'settings' | 'enquiries' | 'backups';

@Component({
  selector: 'app-admin-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  template: `
    @if (!authService.isAuthenticated()) {
      <!-- Unauthenticated Guard View -->
      <div class="min-h-[70vh] flex items-center justify-center p-6 text-center">
        <div class="max-w-md bg-white p-8 rounded-2xl shadow-xl border border-stone-200 space-y-4">
          <mat-icon class="text-4xl text-stone-400">lock</mat-icon>
          <h2 class="text-xl font-bold text-stone-900">Admin Authentication Required</h2>
          <p class="text-xs text-stone-500">Please sign in with merchant credentials to access management controls.</p>
          <a
            routerLink="/admin/login"
            class="inline-block px-5 py-2.5 text-xs font-bold text-white bg-[#be185d] rounded-lg hover:bg-[#9d174d] shadow-sm"
          >
            Go to Admin Login
          </a>
        </div>
      </div>
    } @else {
      <!-- Full Admin Portal Layout -->
      <div class="min-h-screen bg-stone-100/70 pb-20">
        
        <!-- Top Admin Header -->
        <header class="bg-white text-[#282c3f] border-b border-[#eaeaec] sticky top-0 z-40 shadow-xs">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <span class="font-black text-lg tracking-wider text-[#282c3f] uppercase">
                {{ settings().business_name }}
              </span>
              <span class="text-[10px] font-bold uppercase bg-[#fdf2f8] text-[#be185d] px-2.5 py-0.5 rounded-full border border-pink-200">
                Merchant Admin Portal
              </span>
            </div>

            <div class="flex items-center gap-4">
              <a
                routerLink="/"
                target="_blank"
                class="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#535766] hover:text-[#be185d] font-bold transition-colors"
                title="Open storefront in new tab"
              >
                <span>View Public Store</span>
                <mat-icon class="text-xs">open_in_new</mat-icon>
              </a>

              <div class="h-4 w-px bg-[#eaeaec] hidden sm:block"></div>

              <div class="flex items-center gap-3">
                <span class="text-xs text-[#535766] hidden md:inline font-medium">
                  {{ authService.currentUser()?.email }}
                </span>
                <button
                  type="button"
                  (click)="logout()"
                  class="p-1.5 text-stone-500 hover:text-[#be185d] rounded-lg hover:bg-[#fdf2f8] transition-colors cursor-pointer"
                  title="Sign out"
                >
                  <mat-icon class="text-lg">logout</mat-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Secondary Tab Navigation Bar -->
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto text-xs font-medium border-t border-[#f5f5f6]">
            <button
              type="button"
              (click)="activeTab.set('overview')"
              [class]="activeTab() === 'overview' ? 'border-b-2 border-[#be185d] text-[#be185d] font-black' : 'text-[#535766] hover:text-[#282c3f]'"
              class="py-3 px-3 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <mat-icon class="text-sm">dashboard</mat-icon>
              <span>Overview</span>
            </button>

            <button
              type="button"
              (click)="activeTab.set('products')"
              [class]="activeTab() === 'products' ? 'border-b-2 border-[#be185d] text-[#be185d] font-black' : 'text-[#535766] hover:text-[#282c3f]'"
              class="py-3 px-3 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <mat-icon class="text-sm">inventory_2</mat-icon>
              <span>Products ({{ products().length }})</span>
            </button>

            <button
              type="button"
              (click)="activeTab.set('categories')"
              [class]="activeTab() === 'categories' ? 'border-b-2 border-[#be185d] text-[#be185d] font-black' : 'text-[#535766] hover:text-[#282c3f]'"
              class="py-3 px-3 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <mat-icon class="text-sm">category</mat-icon>
              <span>Categories ({{ categories().length }})</span>
            </button>

            <button
              type="button"
              (click)="activeTab.set('settings')"
              [class]="activeTab() === 'settings' ? 'border-b-2 border-[#be185d] text-[#be185d] font-black' : 'text-[#535766] hover:text-[#282c3f]'"
              class="py-3 px-3 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <mat-icon class="text-sm">settings</mat-icon>
              <span>Business & WhatsApp</span>
            </button>

            <button
              type="button"
              (click)="activeTab.set('enquiries')"
              [class]="activeTab() === 'enquiries' ? 'border-b-2 border-[#be185d] text-[#be185d] font-black' : 'text-[#535766] hover:text-[#282c3f]'"
              class="py-3 px-3 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <mat-icon class="text-sm">chat</mat-icon>
              <span>WhatsApp Enquiries Log</span>
            </button>

            <button
              type="button"
              (click)="activeTab.set('backups')"
              [class]="activeTab() === 'backups' ? 'border-b-2 border-[#be185d] text-[#be185d] font-black' : 'text-[#535766] hover:text-[#282c3f]'"
              class="py-3 px-3 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <mat-icon class="text-sm">cloud_download</mat-icon>
              <span>Exports & Backups</span>
            </button>
          </div>
        </header>

        <!-- Main Tab Content Area -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <!-- TAB 1: OVERVIEW -->
          @if (activeTab() === 'overview') {
            <div class="space-y-8">
              <!-- KPI Metric Cards Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div class="bg-white p-5 rounded-xl border border-stone-200/90 shadow-xs space-y-1">
                  <div class="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Products</div>
                  <div class="text-2xl sm:text-3xl font-bold text-stone-900 tabular-nums">{{ totalProducts() }}</div>
                  <div class="text-[11px] text-stone-400">{{ activeProductsCount() }} Active · {{ draftProductsCount() }} Draft</div>
                </div>

                <div class="bg-white p-5 rounded-xl border border-stone-200/90 shadow-xs space-y-1">
                  <div class="text-xs font-semibold text-stone-500 uppercase tracking-wider">Out of Stock</div>
                  <div class="text-2xl sm:text-3xl font-bold text-stone-900 tabular-nums">{{ outOfStockCount() }}</div>
                  <div class="text-[11px] text-amber-600 font-medium">Requires replenishment</div>
                </div>

                <div class="bg-white p-5 rounded-xl border border-stone-200/90 shadow-xs space-y-1">
                  <div class="text-xs font-semibold text-stone-500 uppercase tracking-wider">Categories Active</div>
                  <div class="text-2xl sm:text-3xl font-bold text-stone-900 tabular-nums">{{ categories().length }}</div>
                  <div class="text-[11px] text-stone-400">{{ featuredCount() }} Curated Editions</div>
                </div>

                <div class="bg-white p-5 rounded-xl border border-stone-200/90 shadow-xs space-y-1">
                  <div class="text-xs font-semibold text-stone-500 uppercase tracking-wider">WhatsApp Enquiries</div>
                  <div class="text-2xl sm:text-3xl font-bold text-emerald-700 tabular-nums">{{ enquiries().length }}</div>
                  <div class="text-[11px] text-stone-500">Est. Value: {{ currency() }}{{ totalEnquiryEstValue().toLocaleString() }}</div>
                </div>
              </div>

              <!-- Quick Actions Strip -->
              <div class="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-stone-200">
                <span class="text-xs font-bold text-stone-700 mr-2">Quick Actions:</span>
                <button
                  type="button"
                  (click)="openCreateProductModal()"
                  class="px-3.5 py-2 text-xs font-bold text-white bg-[#be185d] hover:bg-[#9d174d] rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <mat-icon class="text-sm">add</mat-icon>
                  <span>Add New Product</span>
                </button>
                <button
                  type="button"
                  (click)="openCreateCategoryModal()"
                  class="px-3.5 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <mat-icon class="text-sm">create_new_folder</mat-icon>
                  <span>Add Category</span>
                </button>
                <button
                  type="button"
                  (click)="activeTab.set('settings')"
                  class="px-3.5 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <mat-icon class="text-sm">edit_note</mat-icon>
                  <span>Update WhatsApp Number</span>
                </button>
              </div>

              <!-- Recent Enquiries Section -->
              <div class="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-bold text-stone-900 uppercase tracking-wide">
                    Recent WhatsApp Enquiry Clicks
                  </h3>
                  <button
                    type="button"
                    (click)="activeTab.set('enquiries')"
                    class="text-xs text-stone-500 hover:text-stone-900 underline"
                  >
                    View All Logs
                  </button>
                </div>

                <div class="divide-y divide-stone-100">
                  @for (enq of enquiries().slice(0, 5); track enq.id) {
                    <div class="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <div class="font-semibold text-stone-900">{{ enq.customer_name || 'Website Visitor' }}</div>
                        <div class="text-stone-500 text-[11px] truncate max-w-md">{{ enq.products_summary }}</div>
                      </div>
                      <div class="sm:text-right">
                        <div class="font-bold text-stone-900 tabular-nums">{{ currency() }}{{ enq.estimated_total.toLocaleString() }}</div>
                        <div class="text-[10px] text-stone-400">{{ formatDate(enq.created_at) }}</div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          }

          <!-- TAB 2: PRODUCTS MANAGEMENT -->
          @if (activeTab() === 'products') {
            <div class="space-y-6">
              
              <!-- Toolbar -->
              <div class="bg-white p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-center gap-3 flex-1">
                  <!-- Search -->
                  <div class="relative flex-1 max-w-sm">
                    <input
                      type="text"
                      placeholder="Filter by name, SKU..."
                      [value]="productFilterSearch()"
                      (input)="productFilterSearch.set($any($event.target).value)"
                      class="w-full text-xs pl-8 pr-3 py-2 border border-stone-200 rounded-lg text-stone-800"
                    />
                    <mat-icon class="text-stone-400 text-sm absolute left-2.5 top-2.5">search</mat-icon>
                  </div>

                  <!-- Category filter -->
                  <select
                    [value]="productFilterCat()"
                    (change)="productFilterCat.set($any($event.target).value)"
                    class="text-xs bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-700"
                  >
                    <option value="all">All Categories</option>
                    @for (cat of categories(); track cat.id) {
                      <option [value]="cat.id">{{ cat.name }}</option>
                    }
                  </select>

                  <!-- Status filter -->
                  <select
                    [value]="productFilterStatus()"
                    (change)="productFilterStatus.set($any($event.target).value)"
                    class="text-xs bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-700"
                  >
                    <option value="all">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                    <option value="DRAFT">Draft</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <button
                  type="button"
                  (click)="openCreateProductModal()"
                  class="px-4 py-2.5 text-xs font-bold text-white bg-[#be185d] hover:bg-[#9d174d] rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <mat-icon class="text-sm">add</mat-icon>
                  <span>Add Product</span>
                </button>
              </div>

              <!-- Product Table -->
              <div class="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs">
                    <thead class="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                      <tr>
                        <th class="p-3.5">Product</th>
                        <th class="p-3.5">SKU</th>
                        <th class="p-3.5">Category</th>
                        <th class="p-3.5 text-right">Price</th>
                        <th class="p-3.5 text-center">Stock</th>
                        <th class="p-3.5 text-center">Status</th>
                        <th class="p-3.5 text-center">Featured</th>
                        <th class="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-stone-100">
                      @for (p of filteredAdminProducts(); track p.id) {
                        <tr class="hover:bg-stone-50/60 transition-colors">
                          <td class="p-3.5">
                            <div class="flex items-center gap-3">
                              <div class="w-10 h-10 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                                <img
                                  [src]="p.images[0]?.image_url || 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=100&q=80'"
                                  [alt]="p.name"
                                  class="w-full h-full object-cover"
                                  referrerpolicy="no-referrer"
                                />
                              </div>
                              <div class="min-w-0">
                                <div class="font-semibold text-stone-900 truncate max-w-xs">{{ p.name }}</div>
                                <div class="text-[11px] text-stone-400">{{ p.brand || 'Lumina' }}</div>
                              </div>
                            </div>
                          </td>
                          <td class="p-3.5 font-mono text-stone-600 uppercase">{{ p.sku }}</td>
                          <td class="p-3.5 text-stone-600">{{ getCatName(p.category_id) }}</td>
                          <td class="p-3.5 text-right font-bold text-stone-900 tabular-nums">
                            {{ currency() }}{{ p.price.toLocaleString() }}
                          </td>
                          <td class="p-3.5 text-center tabular-nums">
                            <span [class]="p.stock_quantity > 0 ? 'text-stone-800' : 'text-red-600 font-semibold'">
                              {{ p.stock_quantity }}
                            </span>
                          </td>
                          <td class="p-3.5 text-center">
                            <button
                              type="button"
                              (click)="toggleProductStatus(p)"
                              [class]="getStatusBadgeClass(p.status)"
                              class="px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer uppercase tracking-wider"
                              title="Click to toggle status"
                            >
                              {{ p.status }}
                            </button>
                          </td>
                          <td class="p-3.5 text-center">
                            <button
                              type="button"
                              (click)="toggleFeatured(p)"
                              class="text-stone-400 hover:text-amber-500 cursor-pointer"
                              [title]="p.featured ? 'Curated (featured)' : 'Not featured'"
                            >
                              <mat-icon [class.text-amber-500]="p.featured" class="text-base">
                                {{ p.featured ? 'star' : 'star_border' }}
                              </mat-icon>
                            </button>
                          </td>
                          <td class="p-3.5 text-right space-x-1 whitespace-nowrap">
                            <button
                              type="button"
                              (click)="openEditProductModal(p)"
                              class="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                              title="Edit product"
                            >
                              <mat-icon class="text-base">edit</mat-icon>
                            </button>
                            <button
                              type="button"
                              (click)="deleteProduct(p)"
                              class="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                              title="Delete product"
                            >
                              <mat-icon class="text-base">delete</mat-icon>
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          }

          <!-- TAB 3: CATEGORIES MANAGEMENT -->
          @if (activeTab() === 'categories') {
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-base font-bold text-stone-900">Collections & Disciplines</h3>
                  <p class="text-xs text-stone-500">Categories organize catalog browsing and header navigation.</p>
                </div>

                <button
                  type="button"
                  (click)="openCreateCategoryModal()"
                  class="px-4 py-2 text-xs font-bold text-white bg-[#be185d] hover:bg-[#9d174d] rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <mat-icon class="text-sm">add</mat-icon>
                  <span>New Category</span>
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @for (c of categories(); track c.id) {
                  <div class="bg-white p-5 rounded-xl border border-stone-200 space-y-3">
                    <div class="aspect-16/9 rounded-lg overflow-hidden bg-stone-100">
                      <img [src]="c.image_url" [alt]="c.name" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
                    </div>
                    <div>
                      <div class="flex items-center justify-between">
                        <h4 class="font-bold text-stone-900 text-sm">{{ c.name }}</h4>
                        <span class="text-[10px] font-mono text-stone-400">Order: {{ c.display_order }}</span>
                      </div>
                      <p class="text-xs text-stone-500 line-clamp-2 mt-1">{{ c.description }}</p>
                    </div>

                    <div class="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                      <span class="text-stone-400">{{ getCatProductCount(c.id) }} Products</span>
                      <div class="flex items-center gap-1">
                        <button
                          type="button"
                          (click)="openEditCategoryModal(c)"
                          class="p-1 text-stone-500 hover:text-stone-900 rounded"
                        >
                          <mat-icon class="text-base">edit</mat-icon>
                        </button>
                        <button
                          type="button"
                          (click)="deleteCategory(c)"
                          class="p-1 text-stone-400 hover:text-red-700 rounded"
                        >
                          <mat-icon class="text-base">delete</mat-icon>
                        </button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- TAB 4: SETTINGS & WHATSAPP CONFIG -->
          @if (activeTab() === 'settings') {
            <div class="max-w-3xl bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 space-y-6">
              <div>
                <h3 class="text-base font-bold text-stone-900">Business & WhatsApp Configuration</h3>
                <p class="text-xs text-stone-500">Configure numbers, addresses, and announcements across the site.</p>
              </div>

              <form (submit)="saveSettings($event)" class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label for="cfg-biz-name" class="block text-xs font-semibold text-stone-700 mb-1">Business Name</label>
                    <input
                      id="cfg-biz-name"
                      type="text"
                      [value]="editSettingsObj.business_name"
                      (input)="editSettingsObj.business_name = $any($event.target).value"
                      class="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>

                  <div>
                    <label for="cfg-currency" class="block text-xs font-semibold text-stone-700 mb-1">Currency Symbol</label>
                    <input
                      id="cfg-currency"
                      type="text"
                      [value]="editSettingsObj.currency_symbol"
                      (input)="editSettingsObj.currency_symbol = $any($event.target).value"
                      class="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>

                  <div>
                    <label for="cfg-wa-num" class="block text-xs font-semibold text-stone-700 mb-1">
                      WhatsApp Number (International without +)
                    </label>
                    <input
                      id="cfg-wa-num"
                      type="text"
                      placeholder="e.g. 919876543210"
                      [value]="editSettingsObj.whatsapp_number"
                      (input)="editSettingsObj.whatsapp_number = $any($event.target).value"
                      class="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-mono"
                    />
                    <span class="text-[10px] text-stone-400">Used for https://wa.me/&lt;number&gt; click-to-chat links</span>
                  </div>

                  <div>
                    <label for="cfg-phone" class="block text-xs font-semibold text-stone-700 mb-1">Display Telephone</label>
                    <input
                      id="cfg-phone"
                      type="text"
                      [value]="editSettingsObj.phone"
                      (input)="editSettingsObj.phone = $any($event.target).value"
                      class="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>

                  <div>
                    <label for="cfg-email" class="block text-xs font-semibold text-stone-700 mb-1">Concierge Email</label>
                    <input
                      id="cfg-email"
                      type="email"
                      [value]="editSettingsObj.email"
                      (input)="editSettingsObj.email = $any($event.target).value"
                      class="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>

                  <div>
                    <label for="cfg-hours" class="block text-xs font-semibold text-stone-700 mb-1">Business & Concierge Hours</label>
                    <input
                      id="cfg-hours"
                      type="text"
                      [value]="editSettingsObj.business_hours"
                      (input)="editSettingsObj.business_hours = $any($event.target).value"
                      class="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>

                  <div class="sm:col-span-2">
                    <label for="cfg-address" class="block text-xs font-semibold text-stone-700 mb-1">Studio Physical Address</label>
                    <input
                      id="cfg-address"
                      type="text"
                      [value]="editSettingsObj.address"
                      (input)="editSettingsObj.address = $any($event.target).value"
                      class="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>

                  <div class="sm:col-span-2">
                    <label for="cfg-maps" class="block text-xs font-semibold text-stone-700 mb-1">Google Maps URL</label>
                    <input
                      id="cfg-maps"
                      type="text"
                      [value]="editSettingsObj.google_maps_url"
                      (input)="editSettingsObj.google_maps_url = $any($event.target).value"
                      class="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>

                  <div class="sm:col-span-2">
                    <label for="cfg-announcement" class="block text-xs font-semibold text-stone-700 mb-1">Top Announcement Strip Text</label>
                    <input
                      id="cfg-announcement"
                      type="text"
                      [value]="editSettingsObj.announcement"
                      (input)="editSettingsObj.announcement = $any($event.target).value"
                      class="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>

                  <div class="sm:col-span-2">
                    <label for="cfg-about" class="block text-xs font-semibold text-stone-700 mb-1">About the Atelier / Brand Story</label>
                    <textarea
                      id="cfg-about"
                      rows="4"
                      [value]="editSettingsObj.about"
                      (input)="editSettingsObj.about = $any($event.target).value"
                      class="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg text-stone-900"
                    ></textarea>
                  </div>
                </div>

                <div class="pt-4 border-t border-stone-100 flex justify-end">
                  <button
                    type="submit"
                    class="px-6 py-2.5 text-xs font-bold text-white bg-[#be185d] hover:bg-[#9d174d] rounded-lg cursor-pointer shadow-xs"
                  >
                    Save Business Information
                  </button>
                </div>
              </form>
            </div>
          }

          <!-- TAB 5: ENQUIRIES LOG -->
          @if (activeTab() === 'enquiries') {
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-base font-bold text-stone-900">WhatsApp Inquiries Conversion Log</h3>
                  <p class="text-xs text-stone-500">Recorded when visitors click to generate a WhatsApp inquiry.</p>
                </div>
                <div class="text-xs text-stone-500 font-medium">
                  Total Tracked: <span class="font-bold text-stone-900">{{ enquiries().length }}</span>
                </div>
              </div>

              <div class="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <table class="w-full text-left text-xs">
                  <thead class="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th class="p-3.5">ID & Timestamp</th>
                      <th class="p-3.5">Customer Name</th>
                      <th class="p-3.5">Products Summary</th>
                      <th class="p-3.5 text-center">Items</th>
                      <th class="p-3.5 text-right">Est. Value</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-stone-100">
                    @for (e of enquiries(); track e.id) {
                      <tr class="hover:bg-stone-50">
                        <td class="p-3.5">
                          <div class="font-mono text-stone-400 text-[11px]">{{ e.id }}</div>
                          <div class="text-[11px] text-stone-600">{{ formatDate(e.created_at) }}</div>
                        </td>
                        <td class="p-3.5 font-semibold text-stone-900">
                          {{ e.customer_name }}
                          @if (e.customer_notes) {
                            <div class="text-[10px] text-stone-400 font-normal italic">{{ e.customer_notes }}</div>
                          }
                        </td>
                        <td class="p-3.5 text-stone-700 max-w-sm truncate">{{ e.products_summary }}</td>
                        <td class="p-3.5 text-center tabular-nums">{{ e.items_count }}</td>
                        <td class="p-3.5 text-right font-bold text-stone-900 tabular-nums">
                          {{ currency() }}{{ e.estimated_total.toLocaleString() }}
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          <!-- TAB 6: EXPORTS & BACKUPS (Requirement #48) -->
          @if (activeTab() === 'backups') {
            <div class="max-w-3xl space-y-6">
              <div>
                <h3 class="text-base font-bold text-stone-900">Backup & Data Management</h3>
                <p class="text-xs text-stone-500">
                  Requirement #48: Periodic export of catalog data ensures your business assets are safe and portable.
                </p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="bg-white p-5 rounded-xl border border-stone-200 space-y-2">
                  <div class="flex items-center gap-2 text-stone-900 font-semibold text-sm">
                    <mat-icon class="text-base">table_view</mat-icon>
                    <span>Export Products CSV</span>
                  </div>
                  <p class="text-xs text-stone-500 leading-relaxed">
                    Download a full CSV of all 1,000 products with SKUs, prices, stock levels, and categories.
                  </p>
                  <a
                    href="/api/export/products-csv"
                    download="products_export.csv"
                    class="inline-block px-4 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-300"
                  >
                    Download products.csv
                  </a>
                </div>

                <div class="bg-white p-5 rounded-xl border border-stone-200 space-y-2">
                  <div class="flex items-center gap-2 text-stone-900 font-semibold text-sm">
                    <mat-icon class="text-base">folder_zip</mat-icon>
                    <span>Export Categories CSV</span>
                  </div>
                  <p class="text-xs text-stone-500 leading-relaxed">
                    Download complete category taxonomy, slugs, and ordering attributes in CSV format.
                  </p>
                  <a
                    href="/api/export/categories-csv"
                    download="categories_export.csv"
                    class="inline-block px-4 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-300"
                  >
                    Download categories.csv
                  </a>
                </div>

                <div class="bg-white p-5 rounded-xl border border-stone-200 space-y-2 sm:col-span-2">
                  <div class="flex items-center gap-2 text-stone-900 font-semibold text-sm">
                    <mat-icon class="text-base">storage</mat-icon>
                    <span>Full JSON Database Snapshot</span>
                  </div>
                  <p class="text-xs text-stone-500 leading-relaxed">
                    Create an immediate JSON dump containing business configurations, products, image tables, and enquiry history.
                  </p>
                  <a
                    href="/api/export/backup-json"
                    download="catalog_backup.json"
                    class="inline-block px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors"
                  >
                    Download catalog_backup.json
                  </a>
                </div>

                <div class="bg-amber-50/60 p-5 rounded-xl border border-amber-200 space-y-2 sm:col-span-2">
                  <div class="flex items-center gap-2 text-amber-900 font-semibold text-sm">
                    <mat-icon class="text-base text-amber-700">restart_alt</mat-icon>
                    <span>Reset / Re-Seed Demo Catalog</span>
                  </div>
                  <p class="text-xs text-amber-800/80 leading-relaxed">
                    Restore the catalog to the initial 12 handcrafted masterworks and 5 curated collections.
                  </p>
                  <button
                    type="button"
                    (click)="resetDemoData()"
                    class="px-4 py-2 text-xs font-semibold text-amber-950 bg-amber-200/80 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
                  >
                    Restore Demo Seed Data
                  </button>
                </div>
              </div>
            </div>
          }

        </main>

        <!-- Product Modal (Create/Edit) -->
        @if (isProductModalOpen()) {
          <div class="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div class="bg-white max-w-2xl w-full rounded-2xl shadow-2xl border border-stone-200 p-6 sm:p-8 space-y-5 my-8">
              <div class="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 class="text-base font-bold text-stone-900">
                  {{ editingProductId() ? 'Edit Product' : 'Create New Product' }}
                </h3>
                <button type="button" (click)="isProductModalOpen.set(false)" class="text-stone-400 hover:text-stone-700">
                  <mat-icon>close</mat-icon>
                </button>
              </div>

              <form (submit)="saveProductForm($event)" class="space-y-4 text-xs">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label for="prod-f-name" class="block font-semibold text-stone-700 mb-1">Product Name *</label>
                    <input
                      id="prod-f-name"
                      type="text"
                      required
                      [value]="productForm.name"
                      (input)="productForm.name = $any($event.target).value"
                      class="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>

                  <div>
                    <label for="prod-f-sku" class="block font-semibold text-stone-700 mb-1">SKU *</label>
                    <input
                      id="prod-f-sku"
                      type="text"
                      required
                      placeholder="e.g. CER-001"
                      [value]="productForm.sku"
                      (input)="productForm.sku = $any($event.target).value"
                      class="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 uppercase font-mono"
                    />
                  </div>

                  <div>
                    <label for="prod-f-cat" class="block font-semibold text-stone-700 mb-1">Category *</label>
                    <select
                      id="prod-f-cat"
                      [value]="productForm.category_id"
                      (change)="productForm.category_id = $any($event.target).value"
                      class="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 bg-white"
                    >
                      @for (c of categories(); track c.id) {
                        <option [value]="c.id">{{ c.name }}</option>
                      }
                    </select>
                  </div>

                  <div>
                    <label for="prod-f-brand" class="block font-semibold text-stone-700 mb-1">Brand</label>
                    <input
                      id="prod-f-brand"
                      type="text"
                      [value]="productForm.brand"
                      (input)="productForm.brand = $any($event.target).value"
                      class="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>

                  <div>
                    <label for="prod-f-price" class="block font-semibold text-stone-700 mb-1">Price (₹) *</label>
                    <input
                      id="prod-f-price"
                      type="number"
                      required
                      [value]="productForm.price"
                      (input)="productForm.price = +$any($event.target).value"
                      class="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>

                  <div>
                    <label for="prod-f-discount" class="block font-semibold text-stone-700 mb-1">Discount / MRP Price (Optional)</label>
                    <input
                      id="prod-f-discount"
                      type="number"
                      [value]="productForm.discount_price || ''"
                      (input)="productForm.discount_price = $any($event.target).value ? +$any($event.target).value : null"
                      class="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>

                  <div>
                    <label for="prod-f-stock" class="block font-semibold text-stone-700 mb-1">Stock Quantity</label>
                    <input
                      id="prod-f-stock"
                      type="number"
                      [value]="productForm.stock_quantity"
                      (input)="productForm.stock_quantity = +$any($event.target).value"
                      class="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>

                  <div>
                    <label for="prod-f-status" class="block font-semibold text-stone-700 mb-1">Status</label>
                    <select
                      id="prod-f-status"
                      [value]="productForm.status"
                      (change)="productForm.status = $any($event.target).value"
                      class="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 bg-white"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="OUT_OF_STOCK">OUT OF STOCK</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>

                  <div class="sm:col-span-2">
                    <label for="prod-f-img" class="block font-semibold text-stone-700 mb-1">Primary Image URL</label>
                    <input
                      id="prod-f-img"
                      type="url"
                      [value]="productForm.primaryImageUrl"
                      (input)="productForm.primaryImageUrl = $any($event.target).value"
                      placeholder="https://..."
                      class="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-mono text-[11px]"
                    />
                  </div>

                  <div class="sm:col-span-2">
                    <label for="prod-f-short" class="block font-semibold text-stone-700 mb-1">Short Description</label>
                    <input
                      id="prod-f-short"
                      type="text"
                      [value]="productForm.short_description"
                      (input)="productForm.short_description = $any($event.target).value"
                      class="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>

                  <div class="sm:col-span-2">
                    <label for="prod-f-desc" class="block font-semibold text-stone-700 mb-1">Full Description</label>
                    <textarea
                      id="prod-f-desc"
                      rows="3"
                      [value]="productForm.description"
                      (input)="productForm.description = $any($event.target).value"
                      class="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900"
                    ></textarea>
                  </div>

                  <div class="sm:col-span-2 flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="feat-chk"
                      [checked]="productForm.featured"
                      (change)="productForm.featured = $any($event.target).checked"
                      class="accent-stone-900 w-4 h-4 rounded"
                    />
                    <label for="feat-chk" class="font-semibold text-stone-700 cursor-pointer">
                      Feature on Home Page Showcases
                    </label>
                  </div>
                </div>

                <div class="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    (click)="isProductModalOpen.set(false)"
                    class="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="px-5 py-2 bg-[#be185d] text-white rounded-lg hover:bg-[#9d174d] font-bold shadow-xs cursor-pointer"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        }

        <!-- Category Modal (Create/Edit) -->
        @if (isCategoryModalOpen()) {
          <div class="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div class="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-stone-200 p-6 space-y-4">
              <div class="flex items-center justify-between border-b border-stone-100 pb-2">
                <h3 class="text-sm font-bold text-stone-900">
                  {{ editingCategoryId() ? 'Edit Category' : 'Create Category' }}
                </h3>
                <button type="button" (click)="isCategoryModalOpen.set(false)" class="text-stone-400">
                  <mat-icon>close</mat-icon>
                </button>
              </div>

              <form (submit)="saveCategoryForm($event)" class="space-y-3 text-xs">
                <div>
                  <label for="cat-f-name" class="block font-semibold text-stone-700 mb-1">Category Name *</label>
                  <input
                    id="cat-f-name"
                    type="text"
                    required
                    [value]="categoryForm.name"
                    (input)="categoryForm.name = $any($event.target).value"
                    class="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>

                <div>
                  <label for="cat-f-desc" class="block font-semibold text-stone-700 mb-1">Description</label>
                  <textarea
                    id="cat-f-desc"
                    rows="2"
                    [value]="categoryForm.description"
                    (input)="categoryForm.description = $any($event.target).value"
                    class="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900"
                  ></textarea>
                </div>

                <div>
                  <label for="cat-f-img" class="block font-semibold text-stone-700 mb-1">Cover Image URL</label>
                  <input
                    id="cat-f-img"
                    type="url"
                    [value]="categoryForm.image_url"
                    (input)="categoryForm.image_url = $any($event.target).value"
                    class="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label for="cat-f-order" class="block font-semibold text-stone-700 mb-1">Display Order</label>
                  <input
                    id="cat-f-order"
                    type="number"
                    [value]="categoryForm.display_order"
                    (input)="categoryForm.display_order = +$any($event.target).value"
                    class="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900"
                  />
                </div>

                <div class="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    (click)="isCategoryModalOpen.set(false)"
                    class="px-4 py-2 border border-stone-300 rounded-lg text-stone-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="px-5 py-2 bg-[#be185d] text-white rounded-lg hover:bg-[#9d174d] font-bold shadow-xs cursor-pointer"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        }

      </div>
    }
  `,
})
export class AdminDashboard {
  authService = inject(AuthService);
  catalogService = inject(CatalogService);
  private notifications = inject(NotificationService);
  private router = inject(Router);
  private http = inject(HttpClient);

  activeTab = signal<AdminTab>('overview');

  // Signals
  products = this.catalogService.products;
  categories = this.catalogService.categories;
  settings = this.catalogService.settings;
  currency = computed(() => this.settings().currency_symbol || '₹');

  // Metrics
  totalProducts = computed(() => this.products().length);
  activeProductsCount = computed(() => this.products().filter(p => p.status === 'ACTIVE').length);
  draftProductsCount = computed(() => this.products().filter(p => p.status === 'DRAFT' || p.status === 'INACTIVE').length);
  outOfStockCount = computed(() => this.products().filter(p => p.status === 'OUT_OF_STOCK' || p.stock_quantity === 0).length);
  featuredCount = computed(() => this.products().filter(p => p.featured).length);

  // Enquiries state
  enquiries = signal<EnquiryLog[]>([
    {
      id: 'enq_1001',
      customer_name: 'Devika Sharma',
      customer_notes: 'Interested in bespoke timber finish for dining space',
      items_count: 2,
      estimated_total: 33300,
      products_summary: 'Nordic Solid White Oak Low Lounge Chair (x1), Fluted Bone Amphora Vessel (x1)',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 'enq_1002',
      customer_name: 'Arjun Mehta',
      customer_notes: 'Confirm stock for immediate dispatch to Mumbai',
      items_count: 1,
      estimated_total: 12500,
      products_summary: 'Sculptural Brushed Brass Cone Pendant (x1)',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
  ]);

  totalEnquiryEstValue = computed(() => {
    return this.enquiries().reduce((acc, curr) => acc + curr.estimated_total, 0);
  });

  // Product table filters
  productFilterSearch = signal<string>('');
  productFilterCat = signal<string>('all');
  productFilterStatus = signal<string>('all');

  filteredAdminProducts = computed(() => {
    let list = this.products();
    const q = this.productFilterSearch().toLowerCase().trim();
    const cat = this.productFilterCat();
    const st = this.productFilterStatus();

    if (q) {
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    if (cat !== 'all') {
      list = list.filter(p => p.category_id === cat);
    }
    if (st !== 'all') {
      list = list.filter(p => p.status === st);
    }
    return list;
  });

  // Settings Edit Copy
  editSettingsObj: BusinessSettings = { ...this.catalogService.settings() };

  // Modals state
  isProductModalOpen = signal<boolean>(false);
  editingProductId = signal<string | null>(null);
  productForm = {
    name: '',
    sku: '',
    brand: 'Viraasat Couture',
    category_id: '',
    price: 0,
    discount_price: null as number | null,
    stock_quantity: 5,
    status: 'ACTIVE' as ProductStatus,
    featured: false,
    short_description: '',
    description: '',
    primaryImageUrl: '',
  };

  isCategoryModalOpen = signal<boolean>(false);
  editingCategoryId = signal<string | null>(null);
  categoryForm = {
    name: '',
    description: '',
    image_url: '',
    display_order: 1,
  };

  constructor() {
    this.editSettingsObj = { ...this.catalogService.settings() };
    this.fetchEnquiries();
  }

  fetchEnquiries(): void {
    this.http.get<{ recentEnquiries: EnquiryLog[] }>('/api/analytics/summary').subscribe({
      next: (res) => {
        if (res?.recentEnquiries?.length) {
          this.enquiries.set(res.recentEnquiries);
        }
      },
      error: (err) => console.warn(err),
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getCatName(catId: string): string {
    const c = this.categories().find(cat => cat.id === catId);
    return c ? c.name : 'Unknown';
  }

  getCatProductCount(catId: string): number {
    return this.products().filter(p => p.category_id === catId).length;
  }

  getStatusBadgeClass(status: ProductStatus): string {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-800';
      case 'OUT_OF_STOCK': return 'bg-red-100 text-red-800';
      case 'DRAFT': return 'bg-amber-100 text-amber-800';
      default: return 'bg-stone-200 text-stone-700';
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  toggleFeatured(product: Product): void {
    this.catalogService.updateProduct(product.id, { featured: !product.featured });
  }

  toggleProductStatus(product: Product): void {
    const nextStatus: ProductStatus = product.status === 'ACTIVE' ? 'OUT_OF_STOCK' : 'ACTIVE';
    this.catalogService.updateProduct(product.id, { status: nextStatus });
  }

  openCreateProductModal(): void {
    this.editingProductId.set(null);
    this.productForm = {
      name: '',
      sku: `ETHNIC-${Math.floor(100 + Math.random() * 900)}`,
      brand: 'Viraasat Couture',
      category_id: this.categories()[0]?.id || '',
      price: 4500,
      discount_price: null,
      stock_quantity: 8,
      status: 'ACTIVE',
      featured: false,
      short_description: '',
      description: '',
      primaryImageUrl: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1200&q=80',
    };
    this.isProductModalOpen.set(true);
  }

  openEditProductModal(p: Product): void {
    this.editingProductId.set(p.id);
    this.productForm = {
      name: p.name,
      sku: p.sku,
      brand: p.brand || 'Lumina Atelier',
      category_id: p.category_id,
      price: p.price,
      discount_price: p.discount_price ?? null,
      stock_quantity: p.stock_quantity,
      status: p.status,
      featured: p.featured,
      short_description: p.short_description,
      description: p.description,
      primaryImageUrl: p.images[0]?.image_url || '',
    };
    this.isProductModalOpen.set(true);
  }

  async saveProductForm(e: Event): Promise<void> {
    e.preventDefault();
    const id = this.editingProductId();
    const payload: Partial<Product> = {
      name: this.productForm.name,
      sku: this.productForm.sku,
      brand: this.productForm.brand,
      category_id: this.productForm.category_id,
      price: this.productForm.price,
      discount_price: this.productForm.discount_price,
      stock_quantity: this.productForm.stock_quantity,
      status: this.productForm.status,
      featured: this.productForm.featured,
      short_description: this.productForm.short_description,
      description: this.productForm.description,
      images: [
        {
          id: `img_${Date.now()}`,
          image_url: this.productForm.primaryImageUrl || 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1200&q=80',
          alt_text: this.productForm.name,
          display_order: 1,
          is_primary: true,
        }
      ],
    };

    if (id) {
      await this.catalogService.updateProduct(id, payload);
    } else {
      await this.catalogService.createProduct(payload);
    }
    this.isProductModalOpen.set(false);
  }

  async deleteProduct(p: Product): Promise<void> {
    await this.catalogService.deleteProduct(p.id);
  }

  openCreateCategoryModal(): void {
    this.editingCategoryId.set(null);
    this.categoryForm = {
      name: '',
      description: '',
      image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      display_order: this.categories().length + 1,
    };
    this.isCategoryModalOpen.set(true);
  }

  openEditCategoryModal(c: Category): void {
    this.editingCategoryId.set(c.id);
    this.categoryForm = {
      name: c.name,
      description: c.description,
      image_url: c.image_url,
      display_order: c.display_order,
    };
    this.isCategoryModalOpen.set(true);
  }

  async saveCategoryForm(e: Event): Promise<void> {
    e.preventDefault();
    const id = this.editingCategoryId();
    if (id) {
      await this.catalogService.updateCategory(id, this.categoryForm);
    } else {
      await this.catalogService.createCategory(this.categoryForm);
    }
    this.isCategoryModalOpen.set(false);
  }

  async deleteCategory(c: Category): Promise<void> {
    await this.catalogService.deleteCategory(c.id);
  }

  async saveSettings(e: Event): Promise<void> {
    e.preventDefault();
    await this.catalogService.updateSettings(this.editSettingsObj);
  }

  async resetDemoData(): Promise<void> {
    await this.catalogService.resetSeedData();
    this.editSettingsObj = { ...this.catalogService.settings() };
    this.fetchEnquiries();
  }
}
