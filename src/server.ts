import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import {join} from 'node:path';
import {
  INITIAL_BUSINESS_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_COLLECTIONS,
  INITIAL_PRODUCTS,
} from './app/data/initial-catalog';
import {
  BusinessSettings,
  Category,
  EnquiryLog,
  FashionCollection,
  Product,
} from './app/models/catalog.model';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-Memory Database initialized with seed data
let dbProducts: Product[] = [...INITIAL_PRODUCTS];
let dbCategories: Category[] = [...INITIAL_CATEGORIES];
let dbCollections: FashionCollection[] = [...INITIAL_COLLECTIONS];
let dbSettings: BusinessSettings = { ...INITIAL_BUSINESS_SETTINGS };
const dbEnquiries: EnquiryLog[] = [
  {
    id: 'enq_1001',
    customer_name: 'Pooja Singhania',
    customer_notes: 'Need custom blouse stitching with padded cups for wedding reception',
    items_count: 1,
    estimated_total: 14500,
    products_summary: 'Maroon Zari Brocade Banarasi Katan Silk Saree (Color: Maroon, Size: Free Size)',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'enq_1002',
    customer_name: 'Aanya Reddy',
    customer_notes: 'Please confirm dispatch to Hyderabad within 3 days for Mehendi ceremony',
    items_count: 2,
    estimated_total: 12500,
    products_summary: 'Rani Pink Gota Patti Anarkali (Size: M), Mustard Chanderi Kurta Set (Size: M)',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

// Admin session store
const validSessions = new Set<string>();

/* -------------------------------------------------------------
 * API ENDPOINTS
 * ------------------------------------------------------------- */

// Products
app.get('/api/products', (req, res) => {
  const { search, category, collection, fabric, color, size, occasion, status, featured, sort } = req.query;
  let result = [...dbProducts];

  if (category && typeof category === 'string' && category !== 'all') {
    result = result.filter(p => p.category_id === category || p.slug === category);
  }

  if (collection && typeof collection === 'string' && collection !== 'all') {
    result = result.filter(p => p.collections && p.collections.includes(collection));
  }

  if (fabric && typeof fabric === 'string' && fabric !== 'all') {
    result = result.filter(p => p.fabric && p.fabric.toLowerCase().includes(fabric.toLowerCase()));
  }

  if (color && typeof color === 'string' && color !== 'all') {
    result = result.filter(p =>
      (p.color && p.color.toLowerCase() === color.toLowerCase()) ||
      (p.available_colors && p.available_colors.some(c => c.name.toLowerCase() === color.toLowerCase()))
    );
  }

  if (size && typeof size === 'string' && size !== 'all') {
    result = result.filter(p => p.sizes && (p.sizes as readonly string[]).includes(size));
  }

  if (occasion && typeof occasion === 'string' && occasion !== 'all') {
    result = result.filter(p => p.occasion && p.occasion.toLowerCase() === occasion.toLowerCase());
  }

  if (status && typeof status === 'string' && status !== 'all') {
    result = result.filter(p => p.status === status);
  }

  if (featured === 'true') {
    result = result.filter(p => p.featured);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.fabric && p.fabric.toLowerCase().includes(q)) ||
      (p.color && p.color.toLowerCase().includes(q)) ||
      (p.pattern && p.pattern.toLowerCase().includes(q)) ||
      (p.work && p.work.toLowerCase().includes(q)) ||
      (p.occasion && p.occasion.toLowerCase().includes(q)) ||
      p.short_description.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }

  if (sort === 'price_asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    result.sort((a, b) => b.price - a.price);
  } else if (sort === 'name_asc') {
    result.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // newest default
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  res.json({
    total: result.length,
    products: result,
  });
  return;
});

app.get('/api/products/:slugOrId', (req, res) => {
  const target = req.params.slugOrId;
  const product = dbProducts.find(p => p.id === target || p.slug === target);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json(product);
  return;
});

app.post('/api/products', (req, res) => {
  const body = req.body;
  if (!body.name || !body.sku || body.price === undefined) {
    res.status(400).json({ error: 'Name, SKU, and Price are required' });
    return;
  }

  const slug = (body.name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `product-${Date.now()}`;

  const defaultSizes = body.sizes && body.sizes.length ? body.sizes : ['Free Size'];
  const defaultVariants = body.variants && body.variants.length ? body.variants : defaultSizes.map((sz: string, idx: number) => ({
    id: `v_${Date.now()}_${idx}`,
    color_name: body.color || 'Royal Classic',
    color_hex: body.color_hex || '#800020',
    size: sz,
    is_available: true,
    stock_quantity: 5,
    sku_variant: `${body.sku}-${sz}`,
  }));

  const newProduct: Product = {
    id: `prod_${Date.now()}`,
    name: body.name,
    slug: body.slug || slug,
    sku: body.sku.toUpperCase().trim(),
    brand: body.brand || 'Viraasat Couture',
    short_description: body.short_description || '',
    description: body.description || '',
    price: Number(body.price) || 0,
    discount_price: body.discount_price ? Number(body.discount_price) : null,
    category_id: body.category_id || (dbCategories[0]?.id ?? 'cat_sarees'),
    collections: Array.isArray(body.collections) ? body.collections : ['new-arrivals'],
    fabric: body.fabric || 'Pure Viscose Silk',
    color: body.color || 'Maroon',
    color_hex: body.color_hex || '#800020',
    available_colors: Array.isArray(body.available_colors) && body.available_colors.length ? body.available_colors : [
      { name: body.color || 'Maroon', hex: body.color_hex || '#800020' },
    ],
    pattern: body.pattern || 'Embroidered Jaal',
    work: body.work || 'Hand Zari & Resham',
    occasion: body.occasion || 'Festive',
    style: body.style || 'Traditional Fit',
    wash_care: body.wash_care || 'Dry Clean Only',
    sizes: defaultSizes,
    variants: defaultVariants,
    stock_quantity: Number(body.stock_quantity) || 10,
    status: body.status || 'ACTIVE',
    featured: Boolean(body.featured),
    is_new_arrival: Boolean(body.is_new_arrival ?? true),
    is_best_seller: Boolean(body.is_best_seller ?? false),
    specifications: Array.isArray(body.specifications) ? body.specifications : [],
    size_chart_type: body.size_chart_type || 'kurtis',
    images: Array.isArray(body.images) && body.images.length > 0 ? body.images : [
      {
        id: `img_${Date.now()}_1`,
        image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
        alt_text: body.name,
        display_order: 1,
        is_primary: true,
        view_type: 'front',
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  dbProducts.unshift(newProduct);
  res.status(201).json(newProduct);
  return;
});

app.put('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const index = dbProducts.findIndex(p => p.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const updated: Product = {
    ...dbProducts[index],
    ...req.body,
    id,
    updated_at: new Date().toISOString(),
  };

  dbProducts[index] = updated;
  res.json(updated);
  return;
});

app.delete('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const initialLength = dbProducts.length;
  dbProducts = dbProducts.filter(p => p.id !== id);
  if (dbProducts.length === initialLength) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json({ success: true, message: 'Product deleted' });
  return;
});

// Categories
app.get('/api/categories', (req, res) => {
  const sorted = [...dbCategories].sort((a, b) => a.display_order - b.display_order);
  res.json(sorted);
  return;
});

app.post('/api/categories', (req, res) => {
  const { name, description, image_url, status, display_order } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Category name is required' });
    return;
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newCat: Category = {
    id: `cat_${Date.now()}`,
    name,
    slug,
    description: description || '',
    image_url: image_url || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    status: status || 'ACTIVE',
    display_order: Number(display_order) || dbCategories.length + 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  dbCategories.push(newCat);
  res.status(201).json(newCat);
  return;
});

app.put('/api/categories/:id', (req, res) => {
  const id = req.params.id;
  const index = dbCategories.findIndex(c => c.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }

  dbCategories[index] = {
    ...dbCategories[index],
    ...req.body,
    id,
    updated_at: new Date().toISOString(),
  };

  res.json(dbCategories[index]);
  return;
});

app.delete('/api/categories/:id', (req, res) => {
  const id = req.params.id;
  const linkedCount = dbProducts.filter(p => p.category_id === id).length;
  if (linkedCount > 0) {
    res.status(400).json({
      error: `Cannot delete category: ${linkedCount} product(s) are assigned to it. Reassign products first.`,
    });
    return;
  }

  dbCategories = dbCategories.filter(c => c.id !== id);
  res.json({ success: true, message: 'Category removed' });
  return;
});

// Collections (Festive Edit, Wedding Collection, Silk Edit, etc.)
app.get('/api/collections', (req, res) => {
  const sorted = [...dbCollections].sort((a, b) => a.display_order - b.display_order);
  res.json(sorted);
  return;
});

app.post('/api/collections', (req, res) => {
  const { name, description, image_url, badge_label, display_order } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Collection name is required' });
    return;
  }
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newCol: FashionCollection = {
    id: `col_${Date.now()}`,
    name,
    slug,
    description: description || '',
    image_url: image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    badge_label: badge_label || 'Special',
    display_order: Number(display_order) || dbCollections.length + 1,
  };
  dbCollections.push(newCol);
  res.status(201).json(newCol);
  return;
});

// Business Settings
app.get('/api/settings', (req, res) => {
  res.json(dbSettings);
  return;
});

app.put('/api/settings', (req, res) => {
  dbSettings = {
    ...dbSettings,
    ...req.body,
    id: dbSettings.id,
  };
  res.json(dbSettings);
  return;
});

// Admin Authentication
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (
    (email === 'admin@business.com' && password === 'admin123') ||
    (email === 'admin@viraasatcouture.in' && password === 'admin123')
  ) {
    const token = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    validSessions.add(token);
    res.json({
      token,
      user: {
        id: 'usr_admin_1',
        name: 'Boutique Director',
        email,
        role: 'superadmin',
      },
    });
    return;
  }
  res.status(401).json({ error: 'Invalid email or password' });
  return;
});

app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !validSessions.has(token)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  res.json({
    user: {
      id: 'usr_admin_1',
      name: 'Boutique Director',
      email: 'admin@viraasatcouture.in',
      role: 'superadmin',
    },
  });
  return;
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) validSessions.delete(token);
  res.json({ success: true });
});

// Analytics & WhatsApp Enquiry Logging
app.post('/api/analytics/enquiry-click', (req, res) => {
  const { customer_name, customer_notes, items_count, estimated_total, products_summary } = req.body;
  const log: EnquiryLog = {
    id: `enq_${Date.now()}`,
    customer_name: customer_name || 'Website Customer',
    customer_notes: customer_notes || '',
    items_count: Number(items_count) || 1,
    estimated_total: Number(estimated_total) || 0,
    products_summary: products_summary || '',
    created_at: new Date().toISOString(),
  };
  dbEnquiries.unshift(log);
  res.status(201).json({ success: true, log });
});

app.get('/api/analytics/summary', (req, res) => {
  const totalProducts = dbProducts.length;
  const activeProducts = dbProducts.filter(p => p.status === 'ACTIVE').length;
  const outOfStock = dbProducts.filter(p => p.status === 'OUT_OF_STOCK' || p.stock_quantity === 0).length;
  const draftInactive = dbProducts.filter(p => p.status === 'DRAFT' || p.status === 'INACTIVE').length;
  const featuredCount = dbProducts.filter(p => p.featured).length;
  const categoriesCount = dbCategories.length;
  const totalEnquiries = dbEnquiries.length;
  const totalEstimatedEnquiryValue = dbEnquiries.reduce((acc, curr) => acc + curr.estimated_total, 0);

  res.json({
    totalProducts,
    activeProducts,
    outOfStock,
    draftInactive,
    featuredCount,
    categoriesCount,
    totalEnquiries,
    totalEstimatedEnquiryValue,
    recentEnquiries: dbEnquiries.slice(0, 15),
  });
});

// CSV and JSON Exports
app.get('/api/export/products-csv', (req, res) => {
  const headers = ['ID', 'Name', 'SKU', 'Category_ID', 'Fabric', 'Color', 'Occasion', 'Sizes', 'Price', 'Discount_Price', 'Stock', 'Status'];
  const rows = dbProducts.map(p => [
    p.id,
    `"${(p.name || '').replace(/"/g, '""')}"`,
    p.sku,
    p.category_id,
    `"${(p.fabric || '').replace(/"/g, '""')}"`,
    p.color,
    p.occasion,
    `"${(p.sizes || []).join(', ')}"`,
    p.price,
    p.discount_price || '',
    p.stock_quantity,
    p.status,
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="viraasat_products.csv"');
  res.send(csv);
});

app.get('/api/export/categories-csv', (req, res) => {
  const headers = ['ID', 'Name', 'Slug', 'Status', 'Display_Order'];
  const rows = dbCategories.map(c => [
    c.id,
    `"${(c.name || '').replace(/"/g, '""')}"`,
    c.slug,
    c.status,
    c.display_order,
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="categories_export.csv"');
  res.send(csv);
});

app.get('/api/export/backup-json', (req, res) => {
  const backup = {
    exported_at: new Date().toISOString(),
    boutique: dbSettings.business_name,
    version: '2.0.0-ethnic-fashion',
    business_settings: dbSettings,
    categories: dbCategories,
    collections: dbCollections,
    products: dbProducts,
    enquiries_history: dbEnquiries,
  };
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="viraasat_catalog_backup.json"');
  res.send(JSON.stringify(backup, null, 2));
});

app.post('/api/seed-reset', (req, res) => {
  dbProducts = [...INITIAL_PRODUCTS];
  dbCategories = [...INITIAL_CATEGORIES];
  dbCollections = [...INITIAL_COLLECTIONS];
  dbSettings = { ...INITIAL_BUSINESS_SETTINGS };
  res.json({ success: true, message: 'Database reset to original ethnic fashion catalog' });
});

app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }
    console.log(`Viraasat Couture Server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
