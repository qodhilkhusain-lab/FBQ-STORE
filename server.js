const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

const dataPath = path.join(__dirname, 'data');
const productsFile = path.join(dataPath, 'products.json');
const ordersFile = path.join(dataPath, 'orders.json');
const publicPath = path.join(__dirname, 'public');
const uploadsPath = path.join(publicPath, 'uploads');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const activeAdminTokens = new Set();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.static(publicPath));

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

function readJson(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error(`Gagal membaca file ${filePath}:`, error.message);
    return [];
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function saveProductImage(productId, imageData) {
  if (!imageData) return null;

  const match = String(imageData).match(/^data:(image\/(png|jpe?g|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    const error = new Error('Format foto tidak valid. Gunakan JPG, PNG, atau WEBP.');
    error.statusCode = 400;
    throw error;
  }

  const mimeType = match[1];
  const extension = mimeType === 'image/jpeg' || mimeType === 'image/jpg' ? 'jpg' : match[2];
  const buffer = Buffer.from(match[3], 'base64');
  const maxSize = 3 * 1024 * 1024;

  if (buffer.length > maxSize) {
    const error = new Error('Ukuran foto maksimal 3MB.');
    error.statusCode = 400;
    throw error;
  }

  const fileName = `product-${productId}-${Date.now()}.${extension}`;
  const filePath = path.join(uploadsPath, fileName);
  fs.writeFileSync(filePath, buffer);

  return `/uploads/${fileName}`;
}

function formatOrderId(prefix = 'ORD') {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${date}-${random}`;
}

function getCookie(req, name) {
  const cookieHeader = req.headers.cookie || '';
  const cookies = cookieHeader.split(';').map((item) => item.trim()).filter(Boolean);
  for (const cookie of cookies) {
    const [key, ...valueParts] = cookie.split('=');
    if (key === name) return decodeURIComponent(valueParts.join('='));
  }
  return null;
}

function requireAdmin(req, res, next) {
  const token = getCookie(req, 'fbq_admin_token');
  if (!token || !activeAdminTokens.has(token)) {
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ message: 'Akses admin diperlukan. Silakan login admin terlebih dahulu.' });
    }
    return res.redirect('/admin-login.html');
  }
  next();
}

function getCustomerTransactions() {
  const orders = readJson(ordersFile).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return orders.map((order) => ({
    orderId: order.id,
    customerName: order.customerName,
    phoneNumber: order.phoneNumber,
    address: order.address,
    paymentMethod: order.paymentMethod,
    itemSummary: order.items.map((item) => `${item.name} x${item.quantity}`).join(', '),
    total: order.total,
    status: order.status,
    transactionDate: order.createdAt
  }));
}

function buildPublicSummary() {
  const products = readJson(productsFile);
  return {
    productCount: products.length,
    totalStock: products.reduce((sum, product) => sum + Number(product.stock || 0), 0)
  };
}

function buildAdminSummary() {
  const products = readJson(productsFile);
  const orders = readJson(ordersFile);
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const customerNames = [...new Set(orders.map((order) => order.customerName))];

  return {
    productCount: products.length,
    totalStock: products.reduce((sum, product) => sum + Number(product.stock || 0), 0),
    transactionCount: orders.length,
    customerCount: customerNames.length,
    totalRevenue
  };
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FBQ Store API berjalan' });
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Username atau password admin salah' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  activeAdminTokens.add(token);

  res.cookie('fbq_admin_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 4
  });

  res.json({ message: 'Login admin berhasil', redirect: '/panel-admin' });
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
  const token = getCookie(req, 'fbq_admin_token');
  if (token) activeAdminTokens.delete(token);
  res.clearCookie('fbq_admin_token');
  res.json({ message: 'Logout berhasil' });
});

app.get('/api/admin/me', requireAdmin, (req, res) => {
  res.json({ username: ADMIN_USERNAME, role: 'admin' });
});

app.get('/api/products', (req, res) => {
  let products = readJson(productsFile);
  const { search, brand, condition, min, max, sort } = req.query;

  if (search) {
    const keyword = search.toLowerCase();
    products = products.filter((item) =>
      `${item.name} ${item.brand} ${item.description} ${item.condition} ${item.ram} ${item.storage} ${item.camera} ${item.battery}`.toLowerCase().includes(keyword)
    );
  }

  if (brand && brand !== 'all') {
    products = products.filter((item) => item.brand.toLowerCase() === brand.toLowerCase());
  }

  if (condition && condition !== 'all') {
    products = products.filter((item) => item.condition.toLowerCase().includes(condition.toLowerCase()));
  }

  if (min) {
    products = products.filter((item) => item.price >= Number(min));
  }

  if (max) {
    products = products.filter((item) => item.price <= Number(max));
  }

  if (sort === 'low') {
    products.sort((a, b) => a.price - b.price);
  }

  if (sort === 'high') {
    products.sort((a, b) => b.price - a.price);
  }

  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const products = readJson(productsFile);
  const product = products.find((item) => item.id === Number(req.params.id));

  if (!product) {
    return res.status(404).json({ message: 'Produk tidak ditemukan' });
  }

  res.json(product);
});

app.post('/api/orders', (req, res) => {
  const { customerName, phoneNumber, address, paymentMethod, items } = req.body;

  if (!customerName || !phoneNumber || !address || !paymentMethod || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Data checkout belum lengkap' });
  }

  const products = readJson(productsFile);
  const orders = readJson(ordersFile);
  const orderItems = [];
  let total = 0;

  for (const item of items) {
    const product = products.find((productItem) => productItem.id === Number(item.productId));
    const quantity = Number(item.quantity || 1);

    if (!product) {
      return res.status(404).json({ message: `Produk dengan ID ${item.productId} tidak ditemukan` });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: 'Jumlah produk tidak valid' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: `Stok ${product.name} tidak cukup` });
    }

    product.stock -= quantity;
    total += product.price * quantity;
    orderItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      subtotal: product.price * quantity
    });
  }

  const newOrder = {
    id: formatOrderId('ORD'),
    customerName,
    phoneNumber,
    address,
    paymentMethod,
    items: orderItems,
    total,
    status: 'Menunggu konfirmasi admin',
    createdAt: new Date().toISOString()
  };

  orders.push(newOrder);
  writeJson(productsFile, products);
  writeJson(ordersFile, orders);

  res.status(201).json({ message: 'Checkout berhasil', order: newOrder });
});

app.get('/api/summary', (req, res) => {
  res.json(buildPublicSummary());
});

app.get('/api/admin/summary', requireAdmin, (req, res) => {
  res.json(buildAdminSummary());
});

app.get('/api/admin/orders', requireAdmin, (req, res) => {
  const orders = readJson(ordersFile).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(orders);
});

app.patch('/api/admin/orders/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body;
  const allowedStatus = ['Menunggu konfirmasi admin', 'Diproses admin', 'Dikirim', 'Selesai', 'Dibatalkan'];

  if (!allowedStatus.includes(status)) {
    return res.status(400).json({ message: 'Status transaksi tidak valid' });
  }

  const orders = readJson(ordersFile);
  const order = orders.find((item) => item.id === req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();
  writeJson(ordersFile, orders);

  res.json({ message: 'Status transaksi berhasil diperbarui', order });
});

app.get('/api/admin/customers', requireAdmin, (req, res) => {
  res.json(getCustomerTransactions());
});

app.get('/api/admin/products', requireAdmin, (req, res) => {
  res.json(readJson(productsFile));
});

app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  const products = readJson(productsFile);
  const productIndex = products.findIndex((item) => item.id === Number(req.params.id));

  if (productIndex === -1) {
    return res.status(404).json({ message: 'Produk tidak ditemukan' });
  }

  const product = products[productIndex];
  if (Number(product.stock) > 0) {
    return res.status(400).json({ message: 'Produk hanya dapat dihapus jika stok sudah kosong' });
  }

  if (product.image) {
    const imagePath = path.join(publicPath, product.image);
    if (fs.existsSync(imagePath)) {
      try {
        fs.unlinkSync(imagePath);
      } catch (error) {
        console.error('Gagal menghapus file gambar produk:', error.message);
      }
    }
  }

  products.splice(productIndex, 1);
  writeJson(productsFile, products);

  res.json({ message: 'Produk berhasil dihapus' });
});

app.post('/api/admin/products', requireAdmin, (req, res) => {
  const {
    name,
    brand,
    condition,
    description,
    price,
    stock,
    label,
    ram,
    storage,
    camera,
    battery,
    imageData
  } = req.body;

  if (!name || !brand || !condition || !description || !imageData) {
    return res.status(400).json({ message: 'Nama, merek, kondisi, deskripsi, dan foto produk wajib diisi' });
  }

  const numericPrice = Number(price);
  const numericStock = Number(stock);

  if (Number.isNaN(numericPrice) || numericPrice < 0 || Number.isNaN(numericStock) || numericStock < 0) {
    return res.status(400).json({ message: 'Harga dan stok harus berupa angka positif' });
  }

  const products = readJson(productsFile);
  const nextId = products.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;

  const newProduct = {
    id: nextId,
    name: String(name).trim(),
    brand: String(brand).trim(),
    condition: String(condition).trim(),
    price: numericPrice,
    stock: numericStock,
    storage: String(storage || '').trim(),
    ram: String(ram || '').trim(),
    camera: String(camera || '').trim(),
    battery: String(battery || '').trim(),
    description: String(description).trim(),
    label: String(label || '').trim(),
    image: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    newProduct.image = saveProductImage(newProduct.id, imageData);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Gagal menyimpan foto produk' });
  }

  products.push(newProduct);
  writeJson(productsFile, products);

  res.status(201).json({ message: 'Produk baru berhasil ditambahkan', product: newProduct });
});

app.patch('/api/admin/products/:id', requireAdmin, (req, res) => {
  const products = readJson(productsFile);
  const product = products.find((item) => item.id === Number(req.params.id));

  if (!product) {
    return res.status(404).json({ message: 'Produk tidak ditemukan' });
  }

  const allowedFields = ['name', 'brand', 'condition', 'description', 'price', 'stock', 'label', 'ram', 'storage', 'camera', 'battery'];
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      if (field === 'price' || field === 'stock') {
        const numericValue = Number(req.body[field]);
        if (Number.isNaN(numericValue) || numericValue < 0) {
          return res.status(400).json({ message: `${field} harus berupa angka positif` });
        }
        product[field] = numericValue;
      } else {
        product[field] = String(req.body[field]).trim();
      }
    }
  }

  if (req.body.imageData) {
    try {
      product.image = saveProductImage(product.id, req.body.imageData);
    } catch (error) {
      return res.status(error.statusCode || 500).json({ message: error.message || 'Gagal menyimpan foto produk' });
    }
  }

  product.updatedAt = new Date().toISOString();
  writeJson(productsFile, products);
  res.json({ message: 'Produk berhasil diperbarui', product });
});

app.get('/katalog', (req, res) => {
  res.sendFile(path.join(publicPath, 'katalog.html'));
});

app.get('/promo', (req, res) => {
  res.sendFile(path.join(publicPath, 'promo.html'));
});

app.get('/checkout', (req, res) => {
  res.sendFile(path.join(publicPath, 'checkout.html'));
});

app.get('/admin', (req, res) => {
  res.redirect('/admin-login.html');
});

app.get('/admin.html', (req, res) => {
  res.redirect('/admin-login.html');
});

app.get('/panel-admin', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

app.get('/panel-admin/transaksi', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin-transaksi.html'));
});

app.get('/panel-admin/customer', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin-customer.html'));
});

app.get('/panel-admin/produk', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin-produk.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  console.log(`Panel admin: http://localhost:${PORT}/admin-login.html`);
});
