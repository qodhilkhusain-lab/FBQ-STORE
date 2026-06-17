const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const quickBrandFilter = document.getElementById('quickBrandFilter');
const brandFilter = document.getElementById('brandFilter');
const conditionFilter = document.getElementById('conditionFilter');
const sortFilter = document.getElementById('sortFilter');
const resetFilter = document.getElementById('resetFilter');
const productCount = document.getElementById('productCount');
const stockCount = document.getElementById('stockCount');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const clearCart = document.getElementById('clearCart');
const checkoutForm = document.getElementById('checkoutForm');
const checkoutMessage = document.getElementById('checkoutMessage');
const cartBadge = document.getElementById('cartBadge');
const toast = document.getElementById('toast');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const currentPage = document.body.dataset.page || 'home';

let products = [];
let cart = JSON.parse(localStorage.getItem('fbq-cart')) || [];

const rupiah = (value) => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0
}).format(value);

function saveCart() {
  localStorage.setItem('fbq-cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  if (!cartBadge) return;
  const totalItems = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  cartBadge.textContent = totalItems;
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

function applyQueryParamsToFilters() {
  const params = new URLSearchParams(window.location.search);
  const search = params.get('search') || '';
  const brand = params.get('brand') || 'all';
  const condition = params.get('condition') || 'all';

  if (searchInput) searchInput.value = search;
  if (brandFilter) brandFilter.value = brand;
  if (quickBrandFilter) quickBrandFilter.value = brand;
  if (conditionFilter) conditionFilter.value = condition;
}

function buildCatalogUrl() {
  const params = new URLSearchParams();
  const search = searchInput?.value.trim();
  const brand = quickBrandFilter?.value || brandFilter?.value || 'all';

  if (search) params.set('search', search);
  if (brand && brand !== 'all') params.set('brand', brand);

  const query = params.toString();
  return `/katalog.html${query ? `?${query}` : ''}`;
}

async function fetchSummary() {
  if (!productCount && !stockCount) return;

  const response = await fetch('/api/summary');
  const summary = await response.json();

  if (productCount) productCount.textContent = summary.productCount;
  if (stockCount) stockCount.textContent = summary.totalStock;
}

async function fetchProducts() {
  const params = new URLSearchParams();

  if (searchInput?.value.trim()) params.set('search', searchInput.value.trim());
  if (brandFilter && brandFilter.value !== 'all') params.set('brand', brandFilter.value);
  if (conditionFilter && conditionFilter.value !== 'all') params.set('condition', conditionFilter.value);
  if (sortFilter?.value) params.set('sort', sortFilter.value);

  const response = await fetch(`/api/products?${params.toString()}`);
  products = await response.json();

  let displayedProducts = [...products];
  if (currentPage === 'promo') {
    displayedProducts = displayedProducts.filter((product) =>
      String(product.label || '').toLowerCase().includes('promo') || product.id === 1 || product.id === 3
    );
  }

  renderProducts(displayedProducts);

  if (productGrid) {
    if (productCount) productCount.textContent = displayedProducts.length;
    if (stockCount) stockCount.textContent = displayedProducts.reduce((sum, product) => sum + Number(product.stock || 0), 0);
  } else {
    fetchSummary();
  }
}

function renderProducts(items) {
  if (!productGrid) return;

  if (items.length === 0) {
    productGrid.innerHTML = '<p class="empty-state">Produk tidak ditemukan. Coba reset filter.</p>';
    return;
  }

  productGrid.innerHTML = items.map((product) => `
    <article class="product-card">
      <div class="product-media">
        <span class="product-label">${product.label || 'Stok Toko'}</span>
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-info">
        <p class="product-category">${product.brand} • ${product.condition}</p>
        <h3 class="product-title">${product.name}</h3>
        <p class="product-desc">${product.description}</p>
        <div class="product-specs">
          <span>RAM ${product.ram}</span>
          <span>${product.storage}</span>
          <span>${product.camera}</span>
          <span>${product.battery}</span>
        </div>
        <p class="price">${rupiah(product.price)}</p>
        <p class="stock">Stok toko: ${product.stock}</p>
        <button class="btn btn-primary add-cart-btn" onclick="addToCart(${product.id})" ${product.stock < 1 ? 'disabled' : ''}>
          + Tambah Keranjang
        </button>
      </div>
    </article>
  `).join('');
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const existing = cart.find((item) => item.productId === productId);
  if (existing) {
    if (existing.quantity >= product.stock) {
      showToast('Jumlah melebihi stok produk toko');
      return;
    }
    existing.quantity += 1;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  saveCart();
  renderCart();
  showToast(`${product.name} masuk keranjang`);
}

function updateQuantity(productId, action) {
  const item = cart.find((cartItem) => cartItem.productId === productId);
  const product = products.find((productItem) => productItem.id === productId);
  if (!item) return;

  if (action === 'plus') {
    if (product && item.quantity >= product.stock) {
      showToast('Jumlah melebihi stok produk toko');
      return;
    }
    item.quantity += 1;
  }

  if (action === 'minus') item.quantity -= 1;

  if (item.quantity < 1) {
    cart = cart.filter((cartItem) => cartItem.productId !== productId);
  }

  saveCart();
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.productId !== productId);
  saveCart();
  renderCart();
}

function renderCart() {
  if (!cartItems || !cartTotal) {
    updateCartBadge();
    return;
  }

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-state">Keranjang masih kosong. Silakan pilih produk di halaman katalog.</p>';
    cartTotal.textContent = rupiah(0);
    updateCartBadge();
    return;
  }

  cartItems.innerHTML = cart.map((item) => `
    <div class="cart-item">
      <div>
        <strong>${item.name}</strong>
        <p>${rupiah(item.price)} x ${item.quantity}</p>
      </div>
      <div class="cart-actions">
        <button class="qty-btn" onclick="updateQuantity(${item.productId}, 'minus')">−</button>
        <strong>${item.quantity}</strong>
        <button class="qty-btn" onclick="updateQuantity(${item.productId}, 'plus')">+</button>
        <button class="remove-btn" onclick="removeFromCart(${item.productId})">×</button>
      </div>
    </div>
  `).join('');

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = rupiah(total);
  updateCartBadge();
}

async function submitCheckout(event) {
  event.preventDefault();

  if (cart.length === 0) {
    if (checkoutMessage) checkoutMessage.textContent = 'Keranjang masih kosong.';
    showToast('Keranjang masih kosong');
    return;
  }

  const formData = new FormData(checkoutForm);
  const payload = {
    customerName: formData.get('customerName'),
    phoneNumber: formData.get('phoneNumber'),
    address: formData.get('address'),
    paymentMethod: formData.get('paymentMethod'),
    items: cart.map((item) => ({
      productId: item.productId,
      quantity: item.quantity
    }))
  };

  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const result = await response.json();

  if (!response.ok) {
    if (checkoutMessage) checkoutMessage.textContent = result.message || 'Checkout gagal.';
    showToast('Checkout gagal');
    return;
  }

  if (checkoutMessage) {
    checkoutMessage.innerHTML = `Checkout berhasil. Kode pesanan: <strong>${result.order.id}</strong>. Data customer masuk ke panel admin khusus.`;
  }

  checkoutForm.reset();
  cart = [];
  saveCart();
  renderCart();
  fetchProducts();
  showToast('Checkout berhasil');
}

function resetFilters() {
  if (searchInput) searchInput.value = '';
  if (brandFilter) brandFilter.value = 'all';
  if (quickBrandFilter) quickBrandFilter.value = 'all';
  if (conditionFilter) conditionFilter.value = 'all';
  if (sortFilter) sortFilter.value = '';
  fetchProducts();
}

function bindEvents() {
  searchButton?.addEventListener('click', () => {
    if (productGrid) fetchProducts();
    else window.location.href = buildCatalogUrl();
  });

  searchInput?.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      if (productGrid) fetchProducts();
      else window.location.href = buildCatalogUrl();
    }
  });

  quickBrandFilter?.addEventListener('change', () => {
    if (brandFilter) brandFilter.value = quickBrandFilter.value;
    if (productGrid) fetchProducts();
    else window.location.href = buildCatalogUrl();
  });

  brandFilter?.addEventListener('change', () => {
    if (quickBrandFilter) quickBrandFilter.value = brandFilter.value;
    fetchProducts();
  });

  conditionFilter?.addEventListener('change', fetchProducts);
  sortFilter?.addEventListener('change', fetchProducts);
  resetFilter?.addEventListener('click', resetFilters);

  clearCart?.addEventListener('click', () => {
    cart = [];
    saveCart();
    renderCart();
    showToast('Keranjang dikosongkan');
  });

  checkoutForm?.addEventListener('submit', submitCheckout);
  menuToggle?.addEventListener('click', () => navLinks?.querySelector('.nav-inner')?.classList.toggle('active'));

  navLinks?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => navLinks.querySelector('.nav-inner')?.classList.remove('active'));
  });
}

applyQueryParamsToFilters();
bindEvents();
fetchProducts();
renderCart();
