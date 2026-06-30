# FBQ Store - E-Commerce Handphone

FBQ Store adalah web e-commerce toko pribadi untuk jual beli handphone. Tampilan dibuat mengikuti gaya template **Electro** dengan halaman publik yang dipisah: home, katalog, promo, dan checkout. Halaman admin tidak ditampilkan pada homepage atau navigasi publik.

## Kelompok 15 :
### 1. Ahmad Qodhil Khusain (202451140)
### 2. M.Boby Ramadhani (202451134) 
### 3. Fadhil Abrar Faiq (202451146)

## Pembagian Jobdesk
# 1. M.Boby Ramadhani (202451134)
Backend & Datebase Developer `server.js, package.json, .gitignore, data/products.json, data/orders.json`
# 2. Ahmad Qodhil Khusain (202451140)

Admin Panel Developer (admin) dan Deploy `admin-login.html, views/admin.html, css/admin.css, admin-login.js, admin.js`
Buka link admin tersendiri melalui:

```bash
https://fbq-store-production.up.railway.app/admin
```

Data akun admin tidak lagi ditampilkan pada halaman login. Untuk mengganti username dan password, gunakan environment variable `ADMIN_USERNAME` dan `ADMIN_PASSWORD`.
Fitur admin:

- Login admin khusus.
- Dashboard ringkasan toko.
- Total produk toko.
- Total transaksi.
- Jumlah customer pembeli.
- Total omzet.
- Data transaksi masuk.
- Tabel nama customer yang sudah membeli.
- Detail produk yang dibeli.
- Update status pesanan.
- Edit data produk toko, seperti foto, nama, merek, kondisi, spesifikasi HP, harga, stok, label, dan deskripsi.
- Tombol Hapus dikatalok jika stoknya habih
- Menambahkan Data produk toko
- Tombol logout admin.

# 3. Fadhil Abrar Faiq (202451146)
Frontend UI/UX Developer (user) `indek.html, katalog.html, promo.html, checkout.html, css/user.css, app.js`
## Perubahan Terbaru

Admin sekarang dibuat melalui **panel admin khusus**. Link admin tidak ditampilkan di homepage, katalog, promo, atau checkout. Admin masuk melalui URL khusus dan login terlebih dahulu.

| Halaman | File / Route | Isi Halaman |
|---|---|---|
| Home | `public/index.html` | Profil toko handphone FBQ Store |
| Katalog HP | `public/katalog.html` | Produk, pencarian, filter, dan tombol tambah keranjang |
| Promo Toko | `public/promo.html` | Informasi promo dan produk promo |
| Checkout | `public/checkout.html` | Keranjang, form customer, dan proses transaksi |
| Login Admin | `public/admin-login.html` | Form login admin khusus |
| Panel Admin | `/panel-admin` + `views/admin.html` | Dashboard, transaksi, customer, status pesanan, dan edit produk |





# Fitur Utama FBQ Store

### Halaman Home

- Profil toko FBQ Store.
- Penjelasan bahwa toko ini adalah toko pribadi.
- Penjelasan bahwa produk berasal dari stok toko sendiri.
- Keunggulan toko.
- Navigasi publik hanya ke katalog, promo, dan checkout.

### Halaman Katalog

- Katalog handphone.
- Pencarian produk.
- Filter merek.
- Filter kondisi baru/bekas.
- Sorting harga termurah/termahal.
- Tombol tambah ke keranjang.

### Halaman Promo

- Informasi promo toko.
- Produk yang sedang dipromosikan.
- Tombol tambah produk promo ke keranjang.

### Halaman Checkout

- Keranjang belanja.
- Total pesanan.
- Form nama customer.
- Form nomor WhatsApp.
- Form alamat.
- Metode pembayaran.
- Data transaksi otomatis masuk ke panel admin khusus.

## Struktur Folder

```bash
fbq-store-admin-panel/
├── data/
│   ├── orders.json
│   └── products.json
├── public/
│   ├── img/
│   ├── admin-login.html
│   ├── admin-login.js
│   ├── admin.js
│   ├── app.js
│   ├── checkout.html
│   ├── index.html
│   ├── katalog.html
│   ├── promo.html
│   └── css/
│       ├── user.css
│       └── admin.css
├── views/
│   └── admin.html
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## Cara Menjalankan Project

Halaman publik:

```bash
http://localhost:3000/katalog.html
http://localhost:3000/promo.html
http://localhost:3000/checkout.html
```

Panel admin khusus:

```bash
http://localhost:3000/admin-login.html
```

## Endpoint API

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/health` | Cek status API |
| GET | `/api/products` | Menampilkan produk publik |
| GET | `/api/products/:id` | Detail produk publik |
| POST | `/api/orders` | Checkout pesanan |
| GET | `/api/summary` | Ringkasan publik produk dan stok |
| POST | `/api/admin/login` | Login admin |
| POST | `/api/admin/logout` | Logout admin |
| GET | `/api/admin/summary` | Ringkasan dashboard admin |
| GET | `/api/admin/orders` | Data transaksi admin |
| GET | `/api/admin/customers` | Nama customer yang sudah membeli |
| GET | `/api/admin/products` | Data produk untuk admin |
| PATCH | `/api/admin/orders/:id/status` | Update status pesanan |
| PATCH | `/api/admin/products/:id` | Edit data produk toko |

- Admin bisa mengedit foto, nama produk, spesifikasi HP (RAM, memori, kamera, baterai), harga, stok, label, kondisi, dan deskripsi produk. Data produk berisi 5 produk untuk setiap merek: Apple, Samsung, Xiaomi, OPPO, Vivo, dan Realme.
