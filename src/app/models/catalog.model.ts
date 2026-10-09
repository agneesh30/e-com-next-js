export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'INACTIVE' | 'OUT_OF_STOCK';

export type ClothingSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL' | 'Free Size';

export type OccasionType = 'Festive' | 'Wedding' | 'Party' | 'Casual' | 'Office' | 'Bridal' | 'Traditional';

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ClothingColor {
  name: string;
  hex: string;
}

export interface ProductVariant {
  id: string;
  color_name: string;
  color_hex: string;
  size: ClothingSize;
  is_available: boolean;
  stock_quantity: number;
  sku_variant?: string;
}

export interface ProductImage {
  id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  is_primary: boolean;
  view_type?: 'front' | 'back' | 'detail' | 'model';
}

export interface FashionCollection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  badge_label?: string;
  display_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  short_description: string;
  description: string;
  price: number;
  discount_price?: number | null;
  category_id: string;
  collections: string[]; // e.g. ['festive-edit', 'wedding-collection', 'silk-edit', 'new-arrivals']
  fabric: string; // Pure Banarasi Silk, Chanderi, Georgette, Organza, Mulmul Cotton, Velvet
  color: string; // Maroon, Rani Pink, Emerald Green, Mustard, Royal Blue, etc.
  color_hex: string;
  available_colors: ClothingColor[];
  pattern: string; // Zari Brocade, Bandhani, Chikankari, Foil Print, Jaal
  work: string; // Zardozi, Gota Patti, Resham Threadwork, Mirror Work
  occasion: OccasionType;
  style: string; // Flared Anarkali, Straight Cut, Kalidar, Pre-stitched Saree
  wash_care: string;
  sizes: ClothingSize[];
  variants: ProductVariant[];
  stock_quantity: number;
  status: ProductStatus;
  featured: boolean;
  is_new_arrival?: boolean;
  is_best_seller?: boolean;
  images: ProductImage[];
  specifications: ProductSpecification[];
  size_chart_type?: 'kurtis' | 'sarees' | 'lehengas' | 'standard';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  status: 'ACTIVE' | 'INACTIVE';
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface BusinessSettings {
  id: string;
  business_name: string;
  tagline: string;
  logo_url: string;
  whatsapp_number: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  google_maps_url: string;
  business_hours: string;
  about: string;
  currency_symbol: string;
  announcement: string;
  instagram_url?: string;
  facebook_url?: string;
  catalog_hero_title?: string;
  catalog_hero_subtitle?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedColorHex?: string;
  selectedSize?: ClothingSize;
  notes?: string;
}

export interface EnquiryLog {
  id: string;
  customer_name?: string;
  customer_notes?: string;
  items_count: number;
  estimated_total: number;
  products_summary: string;
  created_at: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'manager';
}
