# 🧺 iLaundry — Frontend Web App

Aplikasi web modern untuk pelacakan status pengerjaan cucian secara *real-time* dan manajemen operasional kasir laundry.

## 🚀 Fitur Utama
- **Live Order Tracking**: Pelanggan dapat memantau status cucian (`Diterima` ➔ `Dicuci` ➔ `Dikeringkan` ➔ `Disetrika` ➔ `Siap Diambil` ➔ `Selesai`) dengan nomor resi atau WhatsApp.
- **Katalog & Simulator Tarif**: Perhitungan estimasi biaya instan.
- **Form Booking Order**: Pencatatan pesanan otomatis yang langsung menghasilkan nomor resi unik.
- **Panel Kasir & Admin**: Pengelolaan pesanan, 1-click update status, dan integrasi pengiriman nota WhatsApp.
- **Manajemen Layanan Mandiri (CRUD)**: Admin dapat menambah, mengubah tarif, atau menghapus layanan laundry langsung dari antarmuka web.

## 📂 Struktur Berkas
```
ilaundry/
├── index.html        ← Halaman utama aplikasi (Wajib di root)
├── css/
│   └── style.css     ← Stylesheet responsif
├── js/
│   ├── config.js     ← URL endpoint REST API Google Apps Script
│   └── app.js        ← Logika SPA dan komunikasi fetch CORS-safe
└── README.md
```

## ⚙️ Konfigurasi
Sebelum melakukan deploy ke GitHub Pages, pastikan Anda telah memasukkan URL Web App Google Apps Script Anda ke dalam berkas `js/config.js`:
```javascript
const CONFIG = {
  GAS_URL: 'https://script.google.com/macros/s/AKfycb.../exec',
  // ...
};
```
