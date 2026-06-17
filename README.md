# FBQ Store - E-Commerce Handphone

FBQ Store adalah web e-commerce toko pribadi untuk jual beli handphone. Tampilan dibuat mengikuti gaya template **Electro** dengan halaman publik yang dipisah: home, katalog, promo, dan checkout. Halaman admin tidak ditampilkan pada homepage atau navigasi publik.

## Ketentuan yang Dipenuhi

- Menggunakan JavaScript.
- Menggunakan Express.js.
- Tema menyesuaikan: e-commerce jual beli handphone.
- Model toko pribadi, bukan marketplace.
- Produk yang tampil hanya stok milik toko.
- Dokumentasi proyek tersedia di README.
- Siap diunggah ke GitHub.
- Siap deploy ke Render/Railway/hosting Node.js lain.

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

## Fitur Utama

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

### Panel Admin Khusus

Buka link admin tersendiri melalui:

```bash
http://localhost:3000/admin-login.html
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
- Tombol logout admin.

> Untuk deploy, username dan password admin bisa diganti melalui environment variable `ADMIN_USERNAME` dan `ADMIN_PASSWORD`.

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

Pastikan Node.js sudah terpasang.

```bash
npm install
npm start
```

Setelah server berjalan, buka:

```bash
http://localhost:3000
```

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

## Cara Upload ke GitHub

```bash
git init
git add .
git commit -m "Membuat web FBQ Store dengan panel admin khusus"
git branch -M main
git remote add origin https://github.com/username/fbq-store.git
git push -u origin main
```

## Cara Deploy ke Render

1. Upload project ke GitHub.
2. Buka Render.
3. Pilih **New Web Service**.
4. Hubungkan repository GitHub.
5. Isi pengaturan berikut:
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Tambahkan environment variable jika ingin mengganti akun admin:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
7. Klik **Deploy**.

## Catatan

Data produk dan transaksi disimpan di file JSON agar sederhana untuk tugas. Untuk penggunaan nyata, data sebaiknya disimpan di database seperti MongoDB, MySQL, atau PostgreSQL. Sistem login admin ini dibuat sederhana untuk kebutuhan tugas dasar, bukan untuk keamanan produksi penuh.


## Revisi Struktur Halaman Admin

Konten admin sudah dipisahkan menjadi halaman sendiri-sendiri agar tidak menumpuk dalam satu halaman. Semua halaman berikut hanya bisa dibuka setelah login admin:

- `/panel-admin` untuk dashboard ringkasan admin.
- `/panel-admin/transaksi` untuk data transaksi dan ubah status pesanan.
- `/panel-admin/customer` untuk nama customer yang sudah membeli dan riwayat transaksi.
- `/panel-admin/produk` untuk mengedit data produk toko.

Link admin tidak ditampilkan pada navigasi homepage publik. Untuk masuk admin, buka langsung:

```bash
http://localhost:3000/admin-login.html
```

Akun demo lokal tidak ditampilkan pada halaman login admin.

- Admin bisa mengedit foto, nama produk, spesifikasi HP (RAM, memori, kamera, baterai), harga, stok, label, kondisi, dan deskripsi produk. Data produk berisi 5 produk untuk setiap merek: Apple, Samsung, Xiaomi, OPPO, Vivo, dan Realme.
