import {Injectable, computed, inject, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CartItem, ClothingSize, Product} from '../models/catalog.model';
import {CatalogService} from './catalog.service';
import {NotificationService} from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private catalogService = inject(CatalogService);
  private notifications = inject(NotificationService);
  private http = inject(HttpClient);

  private readonly CART_STORAGE_KEY = 'lumina_enquiry_cart_v1';

  items = signal<CartItem[]>([]);
  isDrawerOpen = signal<boolean>(false);

  totalItems = computed(() => {
    return this.items().reduce((acc, curr) => acc + curr.quantity, 0);
  });

  estimatedTotal = computed(() => {
    return this.items().reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0);
  });

  isEmpty = computed(() => this.items().length === 0);

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(this.CART_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            this.items.set(parsed);
          }
        } catch {
          // ignore corrupted storage
        }
      }
    }
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(this.items()));
    }
  }

  addItem(
    product: Product,
    quantity = 1,
    notes?: string,
    options?: {
      selectedColor?: string;
      selectedColorHex?: string;
      selectedSize?: ClothingSize;
    }
  ): void {
    if (quantity <= 0) return;

    const selectedColor = options?.selectedColor || product.color;
    const selectedColorHex = options?.selectedColorHex || product.color_hex;
    const selectedSize = options?.selectedSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);

    this.items.update((current) => {
      const existingIndex = current.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize
      );
      if (existingIndex > -1) {
        const updated = [...current];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          notes: notes || updated[existingIndex].notes,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          product,
          quantity,
          selectedColor,
          selectedColorHex,
          selectedSize,
          notes,
        };
        return [...current, newItem];
      }
    });

    this.saveToStorage();
    this.notifications.show(`Added "${product.name}" to enquiry cart`, 'success');
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    this.items.update((current) =>
      current.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
    this.saveToStorage();
  }

  removeItem(productId: string): void {
    this.items.update(current => current.filter(item => item.product.id !== productId));
    this.saveToStorage();
    this.notifications.show('Item removed from enquiry cart', 'info');
  }

  clearCart(): void {
    this.items.set([]);
    this.saveToStorage();
  }

  openDrawer(): void {
    this.isDrawerOpen.set(true);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }

  toggleDrawer(): void {
    this.isDrawerOpen.update(v => !v);
  }

  // Generate WhatsApp message for the entire Enquiry Cart
  buildCartMessage(customerName = '', customerLocation = '', customerNotes = ''): string {
    const settings = this.catalogService.settings();
    const currency = settings.currency_symbol || '₹';
    const lines: string[] = [];

    lines.push(`Hello ${settings.business_name},`);
    lines.push('');
    lines.push('I would like to enquire about these products from your online catalog:');
    lines.push('');

    this.items().forEach((item, idx) => {
      const subtotal = item.product.price * item.quantity;
      lines.push(`${idx + 1}. *${item.product.name}*`);
      lines.push(`   SKU: ${item.product.sku}`);
      lines.push(`   Quantity: ${item.quantity}`);
      lines.push(`   Price: ${currency}${item.product.price.toLocaleString()} each (${currency}${subtotal.toLocaleString()})`);
      if (item.notes) {
        lines.push(`   Specification note: ${item.notes}`);
      }
      lines.push('');
    });

    lines.push(`*Estimated Total:* ${currency}${this.estimatedTotal().toLocaleString()}`);
    lines.push('');

    if (customerName.trim()) {
      lines.push(`*Customer Name:* ${customerName.trim()}`);
    }
    if (customerLocation.trim()) {
      lines.push(`*Delivery City/Location:* ${customerLocation.trim()}`);
    }
    if (customerNotes.trim()) {
      lines.push(`*Special Request:* ${customerNotes.trim()}`);
    }

    lines.push('');
    lines.push('Please confirm availability and dispatch timeline.');
    lines.push('Thank you!');

    return lines.join('\n');
  }

  // Generate WhatsApp message for a single product directly from Product Details Page
  buildSingleProductMessage(
    product: Product,
    quantity = 1,
    customerNotes = '',
    options?: {
      selectedColor?: string;
      selectedSize?: ClothingSize;
    }
  ): string {
    const settings = this.catalogService.settings();
    const currency = settings.currency_symbol || '₹';
    const lines: string[] = [];

    lines.push(`Hello ${settings.business_name},`);
    lines.push('');
    lines.push('I am interested in this product from your collection:');
    lines.push('');
    lines.push(`*Product:* ${product.name}`);
    lines.push(`*SKU:* ${product.sku}`);
    if (options?.selectedSize) {
      lines.push(`*Size:* ${options.selectedSize}`);
    }
    if (options?.selectedColor) {
      lines.push(`*Color:* ${options.selectedColor}`);
    }
    lines.push(`*Quantity:* ${quantity}`);
    lines.push(`*Price:* ${currency}${product.price.toLocaleString()}`);
    if (quantity > 1) {
      lines.push(`*Total:* ${currency}${(product.price * quantity).toLocaleString()}`);
    }
    if (customerNotes.trim()) {
      lines.push(`*Notes/Customisation:* ${customerNotes.trim()}`);
    }
    lines.push('');
    lines.push('Please confirm current availability and dispatch details.');
    lines.push('Thank you!');

    return lines.join('\n');
  }

  // Send WhatsApp enquiry
  sendWhatsAppEnquiry(customerName = '', customerLocation = '', customerNotes = ''): void {
    const settings = this.catalogService.settings();
    const rawNumber = settings.whatsapp_number.replace(/[^0-9]/g, '');
    const message = this.buildCartMessage(customerName, customerLocation, customerNotes);

    // Track analytics
    const summary = this.items().map(i => `${i.product.name} (x${i.quantity})`).join(', ');
    this.http.post('/api/analytics/enquiry-click', {
      customer_name: customerName || 'Website Visitor',
      customer_notes: `${customerLocation ? `[${customerLocation}] ` : ''}${customerNotes}`,
      items_count: this.totalItems(),
      estimated_total: this.estimatedTotal(),
      products_summary: summary,
    }).subscribe({ error: (err) => console.warn(err) });

    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${rawNumber}?text=${encoded}`;

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

  sendSingleProductEnquiry(
    product: Product,
    quantity = 1,
    customerNotes = '',
    options?: {
      selectedColor?: string;
      selectedSize?: ClothingSize;
    }
  ): void {
    const settings = this.catalogService.settings();
    const rawNumber = settings.whatsapp_number.replace(/[^0-9]/g, '');
    const message = this.buildSingleProductMessage(product, quantity, customerNotes, options);

    // Track analytics
    this.http.post('/api/analytics/enquiry-click', {
      customer_name: 'Single Product Visitor',
      customer_notes: customerNotes,
      items_count: quantity,
      estimated_total: product.price * quantity,
      products_summary: `${product.name} (SKU: ${product.sku}${options?.selectedSize ? `, Size: ${options.selectedSize}` : ''}) x${quantity}`,
    }).subscribe({ error: (err) => console.warn(err) });

    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${rawNumber}?text=${encoded}`;

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
