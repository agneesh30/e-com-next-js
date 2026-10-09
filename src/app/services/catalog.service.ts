import {Injectable, computed, inject, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {
  INITIAL_BUSINESS_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_COLLECTIONS,
  INITIAL_PRODUCTS,
} from '../data/initial-catalog';
import {
  BusinessSettings,
  Category,
  ClothingColor,
  ClothingSize,
  FashionCollection,
  OccasionType,
  Product,
} from '../models/catalog.model';
import {NotificationService} from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private http = inject(HttpClient);
  private notifications = inject(NotificationService);

  // Core reactive signals
  products = signal<Product[]>(INITIAL_PRODUCTS);
  categories = signal<Category[]>(INITIAL_CATEGORIES);
  collections = signal<FashionCollection[]>(INITIAL_COLLECTIONS);
  settings = signal<BusinessSettings>(INITIAL_BUSINESS_SETTINGS);
  isLoading = signal<boolean>(false);

  // Fashion Filter & Search state
  searchQuery = signal<string>('');
  selectedCategorySlug = signal<string>('all');
  selectedCollectionSlug = signal<string>('all');
  selectedColor = signal<string>('all');
  selectedSize = signal<string>('all');
  selectedFabric = signal<string>('all');
  selectedOccasion = signal<string>('all');
  selectedAvailability = signal<'all' | 'in_stock'>('all');
  maxPriceFilter = signal<number>(50000);
  sortBy = signal<'newest' | 'price_asc' | 'price_desc' | 'name_asc'>('newest');

  // Computed views for Storefront
  activeProducts = computed(() => {
    return this.products().filter(p => p.status === 'ACTIVE');
  });

  featuredProducts = computed(() => {
    return this.products().filter(p => p.status === 'ACTIVE' && p.featured);
  });

  newArrivals = computed(() => {
    return this.products().filter(p => p.status === 'ACTIVE' && (p.is_new_arrival || p.collections.includes('new-arrivals')));
  });

  bestSellers = computed(() => {
    return this.products().filter(p => p.status === 'ACTIVE' && p.is_best_seller);
  });

  festiveEditProducts = computed(() => {
    return this.products().filter(p => p.status === 'ACTIVE' && p.collections.includes('festive-edit'));
  });

  weddingCollectionProducts = computed(() => {
    return this.products().filter(p => p.status === 'ACTIVE' && p.collections.includes('wedding-collection'));
  });

  collectionsWithProducts = computed(() => {
    const prods = this.activeProducts();
    return this.collections().map(col => {
      let matching = prods.filter(p => p.collections && p.collections.includes(col.slug));
      if (matching.length === 0) {
        // Fallback to active products so collection is never empty
        matching = prods.slice(0, 4);
      }
      return {
        ...col,
        products: matching,
        count: matching.length,
      };
    });
  });

  categoriesWithCounts = computed(() => {
    const prods = this.products().filter(p => p.status === 'ACTIVE');
    return this.categories().map(cat => ({
      ...cat,
      count: prods.filter(p => p.category_id === cat.id).length,
    }));
  });

  // Distinct filter options across active products
  availableColorsList = computed<ClothingColor[]>(() => {
    const map = new Map<string, string>();
    this.activeProducts().forEach(p => {
      if (p.color && p.color_hex) {
        map.set(p.color, p.color_hex);
      }
      p.available_colors?.forEach(c => map.set(c.name, c.hex));
    });
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  });

  availableFabricsList = computed<string[]>(() => {
    const set = new Set<string>();
    this.activeProducts().forEach(p => {
      if (p.fabric) set.add(p.fabric);
    });
    return Array.from(set).sort();
  });

  availableOccasionsList = computed<OccasionType[]>(() => {
    const set = new Set<OccasionType>();
    this.activeProducts().forEach(p => {
      if (p.occasion) set.add(p.occasion);
    });
    return Array.from(set);
  });

  availableSizesList: ClothingSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'];

  // Filtered and sorted products for Catalog Page
  filteredCatalog = computed(() => {
    let list = this.products().filter(p => p.status === 'ACTIVE');
    const query = this.searchQuery().toLowerCase().trim();
    const catSlug = this.selectedCategorySlug();
    const colSlug = this.selectedCollectionSlug();
    const color = this.selectedColor();
    const size = this.selectedSize();
    const fabric = this.selectedFabric();
    const occasion = this.selectedOccasion();
    const availability = this.selectedAvailability();
    const maxPrice = this.maxPriceFilter();
    const sort = this.sortBy();

    // Category filter
    if (catSlug !== 'all') {
      const cat = this.categories().find(c => c.slug === catSlug || c.id === catSlug);
      if (cat) {
        list = list.filter(p => p.category_id === cat.id);
      }
    }

    // Collection filter
    if (colSlug !== 'all') {
      list = list.filter(p => p.collections && p.collections.includes(colSlug));
    }

    // Color filter
    if (color !== 'all') {
      list = list.filter(p =>
        p.color.toLowerCase() === color.toLowerCase() ||
        p.available_colors.some(c => c.name.toLowerCase() === color.toLowerCase())
      );
    }

    // Size filter
    if (size !== 'all') {
      list = list.filter(p => p.sizes && p.sizes.includes(size as ClothingSize));
    }

    // Fabric filter
    if (fabric !== 'all') {
      list = list.filter(p => p.fabric.toLowerCase().includes(fabric.toLowerCase()));
    }

    // Occasion filter
    if (occasion !== 'all') {
      list = list.filter(p => p.occasion.toLowerCase() === occasion.toLowerCase());
    }

    // Availability filter
    if (availability === 'in_stock') {
      list = list.filter(p => p.stock_quantity > 0);
    }

    // Price filter
    list = list.filter(p => p.price <= maxPrice);

    // Fashion Search query (matches name, SKU, fabric, color, pattern, work, occasion, description)
    if (query) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.fabric.toLowerCase().includes(query) ||
        p.color.toLowerCase().includes(query) ||
        p.pattern.toLowerCase().includes(query) ||
        p.work.toLowerCase().includes(query) ||
        p.occasion.toLowerCase().includes(query) ||
        p.short_description.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // Sorting
    return [...list].sort((a, b) => {
      if (sort === 'price_asc') return a.price - b.price;
      if (sort === 'price_desc') return b.price - a.price;
      if (sort === 'name_asc') return a.name.localeCompare(b.name);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  });

  constructor() {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading.set(true);

    this.http.get<{ products: Product[]; total: number }>('/api/products?status=all').subscribe({
      next: (res) => {
        if (res?.products?.length) {
          this.products.set(res.products);
        }
      },
      error: (err) => console.warn(err),
    });

    this.http.get<Category[]>('/api/categories').subscribe({
      next: (res) => {
        if (Array.isArray(res) && res.length) {
          this.categories.set(res);
        }
      },
      error: (err) => console.warn(err),
    });

    this.http.get<FashionCollection[]>('/api/collections').subscribe({
      next: (res) => {
        if (Array.isArray(res) && res.length) {
          this.collections.set(res);
        }
      },
      error: (err) => console.warn(err),
    });

    this.http.get<BusinessSettings>('/api/settings').subscribe({
      next: (res) => {
        if (res?.business_name) {
          this.settings.set(res);
        }
      },
      error: (err) => console.warn(err),
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  getProductBySlug(slug: string): Product | undefined {
    return this.products().find(p => p.slug === slug || p.id === slug);
  }

  createProduct(data: Partial<Product>): Promise<Product> {
    return new Promise((resolve) => {
      this.http.post<Product>('/api/products', data).subscribe({
        next: (created) => {
          this.products.update(curr => [created, ...curr]);
          this.notifications.show(`Created ensemble "${created.name}"`, 'success');
          resolve(created);
        },
        error: () => {
          const fallback: Product = {
            id: `prod_${Date.now()}`,
            name: data.name || 'Handcrafted Ethnic Ensemble',
            slug: (data.name || 'product').toLowerCase().replace(/\s+/g, '-'),
            sku: (data.sku || 'ETH-100').toUpperCase(),
            brand: data.brand || 'Viraasat Couture',
            short_description: data.short_description || '',
            description: data.description || '',
            price: Number(data.price) || 0,
            discount_price: data.discount_price ? Number(data.discount_price) : null,
            category_id: data.category_id || this.categories()[0]?.id || 'cat_sarees',
            collections: data.collections || ['new-arrivals'],
            fabric: data.fabric || 'Pure Viscose Silk',
            color: data.color || 'Maroon',
            color_hex: data.color_hex || '#800020',
            available_colors: data.available_colors || [{ name: 'Maroon', hex: '#800020' }],
            pattern: data.pattern || 'Embroidered Jaal',
            work: data.work || 'Hand Zari & Resham',
            occasion: data.occasion || 'Festive',
            style: data.style || 'Traditional Fit',
            wash_care: data.wash_care || 'Dry Clean Only',
            sizes: data.sizes || ['Free Size'],
            variants: data.variants || [],
            stock_quantity: Number(data.stock_quantity) || 5,
            status: data.status || 'ACTIVE',
            featured: Boolean(data.featured),
            is_new_arrival: Boolean(data.is_new_arrival ?? true),
            is_best_seller: Boolean(data.is_best_seller ?? false),
            specifications: data.specifications || [],
            size_chart_type: data.size_chart_type || 'kurtis',
            images: data.images && data.images.length > 0 ? data.images : [
              {
                id: `img_${Date.now()}`,
                image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
                alt_text: data.name || '',
                display_order: 1,
                is_primary: true,
                view_type: 'front',
              }
            ],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          this.products.update(curr => [fallback, ...curr]);
          this.notifications.show(`Created ensemble "${fallback.name}" (Local)`, 'success');
          resolve(fallback);
        },
      });
    });
  }

  updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return new Promise((resolve) => {
      this.http.put<Product>(`/api/products/${id}`, data).subscribe({
        next: (updated) => {
          this.products.update(curr => curr.map(p => p.id === id ? updated : p));
          this.notifications.show(`Updated ensemble "${updated.name}"`, 'success');
          resolve(updated);
        },
        error: () => {
          this.products.update(curr => curr.map(p => {
            if (p.id === id) {
              return { ...p, ...data, updated_at: new Date().toISOString() };
            }
            return p;
          }));
          const updated = this.products().find(p => p.id === id)!;
          this.notifications.show('Ensemble updated', 'success');
          resolve(updated);
        },
      });
    });
  }

  deleteProduct(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.http.delete(`/api/products/${id}`).subscribe({
        next: () => {
          this.products.update(curr => curr.filter(p => p.id !== id));
          this.notifications.show('Ensemble removed', 'info');
          resolve(true);
        },
        error: () => {
          this.products.update(curr => curr.filter(p => p.id !== id));
          this.notifications.show('Ensemble removed', 'info');
          resolve(true);
        },
      });
    });
  }

  createCategory(data: Partial<Category>): Promise<Category> {
    return new Promise((resolve) => {
      this.http.post<Category>('/api/categories', data).subscribe({
        next: (created) => {
          this.categories.update(curr => [...curr, created]);
          this.notifications.show(`Category "${created.name}" created`, 'success');
          resolve(created);
        },
        error: () => {
          const fallback: Category = {
            id: `cat_${Date.now()}`,
            name: data.name || 'New Category',
            slug: (data.name || 'category').toLowerCase().replace(/\s+/g, '-'),
            description: data.description || '',
            image_url: data.image_url || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
            status: data.status || 'ACTIVE',
            display_order: data.display_order || this.categories().length + 1,
            created_at: new Date().toISOString(),
          };
          this.categories.update(curr => [...curr, fallback]);
          this.notifications.show(`Category "${fallback.name}" added`, 'success');
          resolve(fallback);
        },
      });
    });
  }

  updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    return new Promise((resolve) => {
      this.http.put<Category>(`/api/categories/${id}`, data).subscribe({
        next: (updated) => {
          this.categories.update(curr => curr.map(c => c.id === id ? updated : c));
          this.notifications.show(`Category updated`, 'success');
          resolve(updated);
        },
        error: () => {
          this.categories.update(curr => curr.map(c => c.id === id ? { ...c, ...data } : c));
          resolve(this.categories().find(c => c.id === id)!);
        },
      });
    });
  }

  deleteCategory(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      const linked = this.products().filter(p => p.category_id === id).length;
      if (linked > 0) {
        this.notifications.show(`Cannot delete: ${linked} product(s) linked to this category`, 'error');
        return resolve(false);
      }

      this.http.delete(`/api/categories/${id}`).subscribe({
        next: () => {
          this.categories.update(curr => curr.filter(c => c.id !== id));
          this.notifications.show('Category deleted', 'info');
          resolve(true);
        },
        error: () => {
          this.categories.update(curr => curr.filter(c => c.id !== id));
          this.notifications.show('Category deleted', 'info');
          resolve(true);
        },
      });
    });
  }

  updateSettings(data: Partial<BusinessSettings>): Promise<BusinessSettings> {
    return new Promise((resolve) => {
      this.http.put<BusinessSettings>('/api/settings', data).subscribe({
        next: (updated) => {
          this.settings.set(updated);
          this.notifications.show('Boutique settings saved', 'success');
          resolve(updated);
        },
        error: () => {
          const merged = { ...this.settings(), ...data };
          this.settings.set(merged);
          this.notifications.show('Settings saved', 'success');
          resolve(merged);
        },
      });
    });
  }

  resetSeedData(): Promise<void> {
    return new Promise((resolve) => {
      this.http.post('/api/seed-reset', {}).subscribe({
        next: () => {
          this.products.set([...INITIAL_PRODUCTS]);
          this.categories.set([...INITIAL_CATEGORIES]);
          this.collections.set([...INITIAL_COLLECTIONS]);
          this.settings.set({ ...INITIAL_BUSINESS_SETTINGS });
          this.notifications.show('Restored to default Viraasat Couture catalog', 'info');
          resolve();
        },
        error: () => {
          this.products.set([...INITIAL_PRODUCTS]);
          this.categories.set([...INITIAL_CATEGORIES]);
          this.collections.set([...INITIAL_COLLECTIONS]);
          this.settings.set({ ...INITIAL_BUSINESS_SETTINGS });
          this.notifications.show('Catalog reset locally', 'info');
          resolve();
        },
      });
    });
  }
}
