const ordersList = document.getElementById('ordersList');
const customerTableBody = document.getElementById('customerTableBody');
const productTableBody = document.getElementById('productTableBody');
const refreshAdmin = document.getElementById('refreshAdmin');
const refreshCustomers = document.getElementById('refreshCustomers');
const refreshProducts = document.getElementById('refreshProducts');
const logoutAdmin = document.getElementById('logoutAdmin');
const adminProductCount = document.getElementById('adminProductCount');
const adminTransactionCount = document.getElementById('adminTransactionCount');
const adminCustomerCount = document.getElementById('adminCustomerCount');
const adminRevenue = document.getElementById('adminRevenue');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const toast = document.getElementById('toast');
const addProductButton = document.getElementById('addProductButton');
const newProductPhoto = document.getElementById('newProductPhoto');
const newProductPreview = document.getElementById('newProductPreview');
const newProductName = document.getElementById('newProductName');
const newProductBrand = document.getElementById('newProductBrand');
const newProductCondition = document.getElementById('newProductCondition');
const newProductRam = document.getElementById('newProductRam');
const newProductStorage = document.getElementById('newProductStorage');
const newProductCamera = document.getElementById('newProductCamera');
const newProductBattery = document.getElementById('newProductBattery');
const newProductPrice = document.getElementById('newProductPrice');
const newProductStock = document.getElementById('newProductStock');
const newProductLabel = document.getElementById('newProductLabel');
const newProductDescription = document.getElementById('newProductDescription');

const rupiah = (value) => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0
}).format(value);

const formatDate = (dateString) => new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
}).format(new Date(dateString));

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Gagal membaca foto produk'));
    reader.readAsDataURL(file);
  });
}

function updateNewProductPreview() {
  if (!newProductPhoto || !newProductPreview) return;
  const file = newProductPhoto.files?.[0];
  if (!file) {
    newProductPreview.style.display = 'none';
    newProductPreview.src = '';
    return;
  }
  newProductPreview.src = URL.createObjectURL(file);
  newProductPreview.style.display = 'block';
}

function resetNewProductForm() {
  if (newProductPhoto) newProductPhoto.value = '';
  if (newProductPreview) {
    newProductPreview.src = '';
    newProductPreview.style.display = 'none';
  }
  if (newProductName) newProductName.value = '';
  if (newProductBrand) newProductBrand.value = '';
  if (newProductCondition) newProductCondition.value = '';
  if (newProductRam) newProductRam.value = '';
  if (newProductStorage) newProductStorage.value = '';
  if (newProductCamera) newProductCamera.value = '';
  if (newProductBattery) newProductBattery.value = '';
  if (newProductPrice) newProductPrice.value = '';
  if (newProductStock) newProductStock.value = '';
  if (newProductLabel) newProductLabel.value = '';
  if (newProductDescription) newProductDescription.value = '';
}

async function addProduct() {
  if (!newProductPhoto || !newProductName || !newProductBrand || !newProductCondition || !newProductPrice || !newProductStock || !newProductDescription) return;

  const photoFile = newProductPhoto.files?.[0];
  if (!photoFile) {
    showToast('Pilih foto produk terlebih dahulu');
    return;
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(photoFile.type)) {
    showToast('Foto harus JPG, PNG, atau WEBP');
    return;
  }

  if (photoFile.size > 3 * 1024 * 1024) {
    showToast('Ukuran foto maksimal 3MB');
    return;
  }

  const payload = {
    name: newProductName.value.trim(),
    brand: newProductBrand.value.trim(),
    condition: newProductCondition.value.trim(),
    ram: newProductRam.value.trim(),
    storage: newProductStorage.value.trim(),
    camera: newProductCamera.value.trim(),
    battery: newProductBattery.value.trim(),
    label: newProductLabel.value.trim(),
    description: newProductDescription.value.trim(),
    price: Number(newProductPrice.value),
    stock: Number(newProductStock.value),
    imageData: await readFileAsDataUrl(photoFile)
  };

  if (!payload.name || !payload.brand || !payload.condition || !payload.description) {
    showToast('Nama, merek, kondisi, dan deskripsi wajib diisi');
    return;
  }

  if (Number.isNaN(payload.price) || payload.price < 0 || Number.isNaN(payload.stock) || payload.stock < 0) {
    showToast('Harga dan stok harus angka positif');
    return;
  }

  try {
    const response = await adminFetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      showToast(result.message || 'Gagal menambahkan produk');
      return;
    }

    showToast(result.message || 'Produk baru berhasil ditambahkan');
    resetNewProductForm();
    loadProducts();
  } catch (error) {
    if (error.message !== 'Unauthorized') showToast('Gagal menambahkan produk');
  }
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

function handleUnauthorized(response) {
  if (response.status === 401) {
    window.location.href = '/admin-login.html';
    return true;
  }
  return false;
}

async function adminFetch(url, options = {}) {
  const response = await fetch(url, options);
  if (handleUnauthorized(response)) throw new Error('Unauthorized');
  return response;
}

function renderSummary(summary) {
  if (adminProductCount) adminProductCount.textContent = summary.productCount;
  if (adminTransactionCount) adminTransactionCount.textContent = summary.transactionCount;
  if (adminCustomerCount) adminCustomerCount.textContent = summary.customerCount;
  if (adminRevenue) adminRevenue.textContent = rupiah(summary.totalRevenue);
}

function renderOrders(orders) {
  if (!ordersList) return;

  if (orders.length === 0) {
    ordersList.innerHTML = '<p class="empty-state">Belum ada transaksi masuk.</p>';
    return;
  }

  ordersList.innerHTML = orders.map((order) => `
    <article class="order-card">
      <h3>${order.id}</h3>
      <p><strong>Pembeli:</strong> ${order.customerName}</p>
      <p><strong>No. WA:</strong> ${order.phoneNumber}</p>
      <p><strong>Alamat:</strong> ${order.address}</p>
      <p><strong>Pembayaran:</strong> ${order.paymentMethod}</p>
      <p><strong>Total:</strong> ${rupiah(order.total)}</p>
      <p><strong>Barang:</strong> ${order.items.map((item) => `${item.name} x${item.quantity}`).join(', ')}</p>
      <p><strong>Tanggal:</strong> ${formatDate(order.createdAt)}</p>
      <div class="status-row">
        <select data-order-status="${order.id}">
          ${['Menunggu konfirmasi admin', 'Diproses admin', 'Dikirim', 'Selesai', 'Dibatalkan'].map((status) => `
            <option value="${status}" ${status === order.status ? 'selected' : ''}>${status}</option>
          `).join('')}
        </select>
        <button class="btn btn-primary" onclick="updateOrderStatus('${order.id}')">Simpan Status</button>
      </div>
    </article>
  `).join('');
}

function renderCustomerTable(customers) {
  if (!customerTableBody) return;

  if (customers.length === 0) {
    customerTableBody.innerHTML = '<tr><td colspan="7" class="table-empty">Belum ada customer yang transaksi.</td></tr>';
    return;
  }

  customerTableBody.innerHTML = customers.map((customer) => `
    <tr>
      <td><strong>${customer.customerName}</strong></td>
      <td>${customer.orderId}</td>
      <td>${customer.phoneNumber}</td>
      <td>${customer.itemSummary}</td>
      <td>${rupiah(customer.total)}</td>
      <td><span class="status-pill">${customer.status}</span></td>
      <td>${formatDate(customer.transactionDate)}</td>
    </tr>
  `).join('');
}

function renderProductTable(products) {
  if (!productTableBody) return;

  if (products.length === 0) {
    productTableBody.innerHTML = '<tr><td colspan="13" class="table-empty">Belum ada produk toko.</td></tr>';
    return;
  }

  productTableBody.innerHTML = products.map((product) => `
    <tr>
      <td class="product-photo-cell">
        <img class="admin-product-photo" src="${escapeHtml(product.image)}" alt="Foto ${escapeHtml(product.name)}">
        <label class="photo-upload-label" for="productPhoto${product.id}">Pilih foto</label>
        <input class="photo-upload-input" id="productPhoto${product.id}" type="file" accept="image/png,image/jpeg,image/webp" data-product-photo="${product.id}">
        <small>JPG/PNG/WEBP max 3MB</small>
      </td>
      <td><input data-product-field="${product.id}:name" value="${escapeHtml(product.name)}"></td>
      <td><input data-product-field="${product.id}:brand" value="${escapeHtml(product.brand)}"></td>
      <td><input data-product-field="${product.id}:condition" value="${escapeHtml(product.condition)}"></td>
      <td><input class="spec-input" data-product-field="${product.id}:ram" value="${escapeHtml(product.ram || '')}" placeholder="Contoh: 8GB"></td>
      <td><input class="spec-input" data-product-field="${product.id}:storage" value="${escapeHtml(product.storage || '')}" placeholder="Contoh: 256GB"></td>
      <td><input class="spec-input" data-product-field="${product.id}:camera" value="${escapeHtml(product.camera || '')}" placeholder="Contoh: 50MP OIS"></td>
      <td><input class="spec-input" data-product-field="${product.id}:battery" value="${escapeHtml(product.battery || '')}" placeholder="Contoh: 5000 mAh"></td>
      <td><input type="number" min="0" data-product-field="${product.id}:price" value="${product.price}"></td>
      <td><input type="number" min="0" data-product-field="${product.id}:stock" value="${product.stock}"></td>
      <td><input data-product-field="${product.id}:label" value="${escapeHtml(product.label || '')}"></td>
      <td><textarea data-product-field="${product.id}:description">${escapeHtml(product.description)}</textarea></td>
      <td class="action-buttons-cell">
        <button class="btn btn-primary small-save-btn" onclick="updateProduct(${product.id})">Simpan</button>
        ${product.stock <= 0 ? `<button class="btn btn-danger small-delete-btn" onclick="deleteProduct(${product.id})">Hapus</button>` : ''}
      </td>
    </tr>
  `).join('');
}

async function loadSummary() {
  if (!adminProductCount && !adminTransactionCount && !adminCustomerCount && !adminRevenue) return;
  try {
    const summaryResponse = await adminFetch('/api/admin/summary');
    const summary = await summaryResponse.json();
    renderSummary(summary);
  } catch (error) {
    if (error.message !== 'Unauthorized') showToast('Gagal memuat ringkasan admin');
  }
}

async function loadOrders() {
  if (!ordersList) return;
  try {
    const ordersResponse = await adminFetch('/api/admin/orders');
    const orders = await ordersResponse.json();
    renderOrders(orders);
  } catch (error) {
    if (error.message !== 'Unauthorized') showToast('Gagal memuat data transaksi');
  }
}

async function loadCustomers() {
  if (!customerTableBody) return;
  try {
    const customersResponse = await adminFetch('/api/admin/customers');
    const customers = await customersResponse.json();
    renderCustomerTable(customers);
  } catch (error) {
    if (error.message !== 'Unauthorized') showToast('Gagal memuat data customer');
  }
}

async function loadProducts() {
  if (!productTableBody) return;
  try {
    const productsResponse = await adminFetch('/api/admin/products');
    const products = await productsResponse.json();
    renderProductTable(products);
  } catch (error) {
    if (error.message !== 'Unauthorized') showToast('Gagal memuat data produk');
  }
}

async function loadAdminData() {
  await Promise.all([loadSummary(), loadOrders(), loadCustomers(), loadProducts()]);
}

async function updateOrderStatus(orderId) {
  const select = document.querySelector(`[data-order-status="${orderId}"]`);
  if (!select) return;

  const response = await adminFetch(`/api/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: select.value })
  });

  const result = await response.json();
  if (!response.ok) {
    showToast(result.message || 'Gagal mengubah status');
    return;
  }

  showToast('Status transaksi diperbarui');
  loadOrders();
}

async function updateProduct(productId) {
  const fields = ['name', 'brand', 'condition', 'ram', 'storage', 'camera', 'battery', 'price', 'stock', 'label', 'description'];
  const payload = {};

  fields.forEach((field) => {
    const input = document.querySelector(`[data-product-field="${productId}:${field}"]`);
    if (!input) return;
    payload[field] = field === 'price' || field === 'stock' ? Number(input.value) : input.value.trim();
  });

  const photoInput = document.querySelector(`[data-product-photo="${productId}"]`);
  const photoFile = photoInput?.files?.[0];

  if (photoFile) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(photoFile.type)) {
      showToast('Foto harus JPG, PNG, atau WEBP');
      return;
    }

    if (photoFile.size > 3 * 1024 * 1024) {
      showToast('Ukuran foto maksimal 3MB');
      return;
    }

    payload.imageData = await readFileAsDataUrl(photoFile);
  }

  const response = await adminFetch(`/api/admin/products/${productId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  if (!response.ok) {
    showToast(result.message || 'Gagal mengedit produk');
    return;
  }

  showToast(photoFile ? 'Data dan foto produk berhasil diperbarui' : 'Data produk berhasil diperbarui');
  loadProducts();
}

async function deleteProduct(productId) {
  const confirmed = window.confirm('Hapus produk ini? Produk hanya dapat dihapus jika stok sudah kosong.');
  if (!confirmed) return;

  try {
    const response = await adminFetch(`/api/admin/products/${productId}`, {
      method: 'DELETE'
    });

    const result = await response.json();
    if (!response.ok) {
      showToast(result.message || 'Gagal menghapus produk');
      return;
    }

    showToast(result.message || 'Produk berhasil dihapus');
    loadProducts();
  } catch (error) {
    if (error.message !== 'Unauthorized') showToast('Gagal menghapus produk');
  }
}

async function logout() {
  try {
    await adminFetch('/api/admin/logout', { method: 'POST' });
  } catch (error) {
    // Tetap arahkan ke login walaupun sesi sudah kedaluwarsa.
  }
  window.location.href = '/admin-login.html';
}

if (refreshAdmin) refreshAdmin.addEventListener('click', loadOrders);
if (refreshCustomers) refreshCustomers.addEventListener('click', loadCustomers);
if (refreshProducts) refreshProducts.addEventListener('click', loadProducts);
if (productTableBody) {
  productTableBody.addEventListener('change', (event) => {
    const input = event.target.closest('[data-product-photo]');
    if (!input || !input.files?.[0]) return;

    const preview = input.closest('.product-photo-cell')?.querySelector('.admin-product-photo');
    if (preview) preview.src = URL.createObjectURL(input.files[0]);
  });
}
if (newProductPhoto) newProductPhoto.addEventListener('change', updateNewProductPreview);
if (addProductButton) addProductButton.addEventListener('click', addProduct);
if (logoutAdmin) logoutAdmin.addEventListener('click', logout);
if (menuToggle && navLinks) menuToggle.addEventListener('click', () => navLinks.querySelector('.nav-inner')?.classList.toggle('active'));
if (navLinks) navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => navLinks.querySelector('.nav-inner')?.classList.remove('active')));

loadAdminData();
