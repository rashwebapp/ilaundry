/**
 * =========================================================================
 * iLaundry - Interactive Demo Mode Engine (Zero-Risk Sandbox)
 * 100% Client-Side Mock Database via LocalStorage.
 * Tidak ada koneksi ke Google Apps Script asli & tidak memotong kuota WA.
 * =========================================================================
 */

// Kredensial Demo
const DEMO_CONFIG = {
  APP_NAME: 'iLaundry Pro by RASH (Demo Mode)',
  DEMO_USER: 'admin',
  DEMO_PASS: 'demo123',
  DEMO_PASS_ALT: '1234',
  PHONE_CONTACT: '0898-2485-685'
};

const DEFAULT_DEMO_SERVICES = [
  { id: 'L01', nama_layanan: 'Cuci Kering Setrika Reguler', jenis: 'Kiloan', harga: 7000, satuan: 'Kg', estimasi_hari: 2, status_aktif: 'Aktif' },
  { id: 'L02', nama_layanan: 'Cuci Kering Setrika Express', jenis: 'Kiloan', harga: 12000, satuan: 'Kg', estimasi_hari: 1, status_aktif: 'Aktif' },
  { id: 'L03', nama_layanan: 'Setrika Saja (Kiloan)', jenis: 'Kiloan', harga: 5000, satuan: 'Kg', estimasi_hari: 1, status_aktif: 'Aktif' },
  { id: 'L04', nama_layanan: 'Bedcover Besar / Selimut Tebal', jenis: 'Satuan', harga: 25000, satuan: 'Pcs', estimasi_hari: 2, status_aktif: 'Aktif' },
  { id: 'L05', nama_layanan: 'Cuci Sepatu Standard (Sneakers)', jenis: 'Satuan', harga: 30000, satuan: 'Pasang', estimasi_hari: 3, status_aktif: 'Aktif' },
  { id: 'L06', nama_layanan: 'Jas / Blazer Premium Care', jenis: 'Satuan', harga: 35000, satuan: 'Pcs', estimasi_hari: 2, status_aktif: 'Aktif' }
];

const DEFAULT_DEMO_ORDERS = [
  {
    id_pesanan: 'IL-2611-001',
    timestamp: '2026-11-04 09:30:00',
    nama_pelanggan: 'Budi Santoso',
    no_whatsapp: '081234567890',
    layanan: 'Cuci Kering Setrika Reguler',
    jumlah: 4.5,
    total_biaya: 31500,
    status_cucian: 'Selesai',
    status_bayar: 'Lunas',
    catatan: 'Pakaian kerja, lipat rapi'
  },
  {
    id_pesanan: 'IL-2611-002',
    timestamp: '2026-11-04 11:15:00',
    nama_pelanggan: 'Siti Rahma',
    no_whatsapp: '085211223344',
    layanan: 'Cuci Kering Setrika Express',
    jumlah: 3.0,
    total_biaya: 36000,
    status_cucian: 'Siap Diambil',
    status_bayar: 'Lunas',
    catatan: 'Dibutuhkan sore ini'
  },
  {
    id_pesanan: 'IL-2611-003',
    timestamp: '2026-11-04 14:00:00',
    nama_pelanggan: 'Ahmad Fauzi',
    no_whatsapp: '087899887766',
    layanan: 'Bedcover Besar / Selimut Tebal',
    jumlah: 2,
    total_biaya: 50000,
    status_cucian: 'Siap Diambil',
    status_bayar: 'Belum Lunas',
    catatan: 'Warna biru tua & coklat'
  },
  {
    id_pesanan: 'IL-2611-004',
    timestamp: '2026-11-04 16:45:00',
    nama_pelanggan: 'Rina Marlina',
    no_whatsapp: '081377889900',
    layanan: 'Cuci Sepatu Standard (Sneakers)',
    jumlah: 2,
    total_biaya: 60000,
    status_cucian: 'Dicuci',
    status_bayar: 'Lunas',
    catatan: 'Sepatu kanvas putih'
  },
  {
    id_pesanan: 'IL-2611-005',
    timestamp: '2026-11-05 08:20:00',
    nama_pelanggan: 'Doni Prasetyo',
    no_whatsapp: '082155667788',
    layanan: 'Cuci Kering Setrika Reguler',
    jumlah: 5.0,
    total_biaya: 35000,
    status_cucian: 'Diterima',
    status_bayar: 'Belum Lunas',
    catatan: 'Pakaian olahraga'
  },
  {
    id_pesanan: 'IL-2611-006',
    timestamp: '2026-11-05 09:10:00',
    nama_pelanggan: 'Hendra Gunawan',
    no_whatsapp: '081922334455',
    layanan: 'Jas / Blazer Premium Care',
    jumlah: 1,
    total_biaya: 35000,
    status_cucian: 'Diterima',
    status_bayar: 'Lunas',
    catatan: 'Jas hitam pesta'
  },
  {
    id_pesanan: 'IL-2610-021',
    timestamp: '2026-10-28 10:00:00',
    nama_pelanggan: 'Dian Pertiwi',
    no_whatsapp: '085611223344',
    layanan: 'Cuci Kering Setrika Reguler',
    jumlah: 5.5,
    total_biaya: 38500,
    status_cucian: 'Selesai',
    status_bayar: 'Lunas',
    catatan: 'Langganan bulanan'
  },
  {
    id_pesanan: 'IL-2610-022',
    timestamp: '2026-10-29 13:40:00',
    nama_pelanggan: 'Reza Pratama',
    no_whatsapp: '087788990011',
    layanan: 'Bedcover Besar / Selimut Tebal',
    jumlah: 1,
    total_biaya: 25000,
    status_cucian: 'Selesai',
    status_bayar: 'Lunas',
    catatan: ''
  },
  {
    id_pesanan: 'IL-2610-023',
    timestamp: '2026-10-30 15:10:00',
    nama_pelanggan: 'Putri Handayani',
    no_whatsapp: '081344556677',
    layanan: 'Cuci Sepatu Standard (Sneakers)',
    jumlah: 3,
    total_biaya: 90000,
    status_cucian: 'Selesai',
    status_bayar: 'Lunas',
    catatan: 'Sepatu anak sekolah'
  },
  {
    id_pesanan: 'IL-2610-024',
    timestamp: '2026-10-31 16:30:00',
    nama_pelanggan: 'Wahyu Nugroho',
    no_whatsapp: '082266778899',
    layanan: 'Cuci Kering Setrika Reguler',
    jumlah: 8.0,
    total_biaya: 56000,
    status_cucian: 'Selesai',
    status_bayar: 'Lunas',
    catatan: ''
  }
];

const DEFAULT_DEMO_CUSTOMERS = [
  { nama_pelanggan: 'Budi Santoso', no_whatsapp: '081234567890', total_orders: 5 },
  { nama_pelanggan: 'Siti Rahma', no_whatsapp: '085211223344', total_orders: 3 },
  { nama_pelanggan: 'Ahmad Fauzi', no_whatsapp: '087899887766', total_orders: 4 },
  { nama_pelanggan: 'Rina Marlina', no_whatsapp: '081377889900', total_orders: 2 },
  { nama_pelanggan: 'Doni Prasetyo', no_whatsapp: '082155667788', total_orders: 1 },
  { nama_pelanggan: 'Hendra Gunawan', no_whatsapp: '081922334455', total_orders: 3 }
];

const DEFAULT_DEMO_SETTINGS = {
  cs_phone: '08982485685',
  store_name: 'iLaundry Pro by RASH',
  fonnte_active: true,
  fonnte_token: 'FbknoZ6kJ16R7BZGgJap',
  qris_image_url: '',
  qris_merchant_name: 'iLaundry Pro by RASH',
  bank_name: 'BCA',
  bank_account_number: '1234567890',
  bank_account_holder: 'RASH Laundry Express',
  super_admin_pass: 'owner123'
};

// State Demo
const state = {
  services: [],
  orders: [],
  customers: [],
  settings: {},
  currentOrderPayTiming: 'Lunas',
  currentOrderPayMethod: 'CASH',
  activeSettlementOrder: null,
  settlementPayMethod: 'CASH',
  currentTab: 'tracking',
  isLoading: false
};

const STATUS_STEPS = ['Diterima', 'Dicuci', 'Dikeringkan', 'Disetrika', 'Siap Diambil', 'Selesai'];

// ============================================
// LOCAL STORAGE MOCK ENGINE
// ============================================

function initDemoStorage(forceReset = false) {
  if (forceReset || !localStorage.getItem('ilaundry_demo_services')) {
    localStorage.setItem('ilaundry_demo_services', JSON.stringify(DEFAULT_DEMO_SERVICES));
  }
  if (forceReset || !localStorage.getItem('ilaundry_demo_orders')) {
    localStorage.setItem('ilaundry_demo_orders', JSON.stringify(DEFAULT_DEMO_ORDERS));
  }
  if (forceReset || !localStorage.getItem('ilaundry_demo_customers')) {
    localStorage.setItem('ilaundry_demo_customers', JSON.stringify(DEFAULT_DEMO_CUSTOMERS));
  }
  if (forceReset || !localStorage.getItem('ilaundry_demo_settings')) {
    localStorage.setItem('ilaundry_demo_settings', JSON.stringify(DEFAULT_DEMO_SETTINGS));
  }

  try {
    state.services = JSON.parse(localStorage.getItem('ilaundry_demo_services')) || [];
    state.orders = JSON.parse(localStorage.getItem('ilaundry_demo_orders')) || [];
    state.customers = JSON.parse(localStorage.getItem('ilaundry_demo_customers')) || DEFAULT_DEMO_CUSTOMERS;
    state.settings = JSON.parse(localStorage.getItem('ilaundry_demo_settings')) || DEFAULT_DEMO_SETTINGS;
  } catch (e) {
    state.services = DEFAULT_DEMO_SERVICES;
    state.orders = DEFAULT_DEMO_ORDERS;
    state.customers = DEFAULT_DEMO_CUSTOMERS;
    state.settings = DEFAULT_DEMO_SETTINGS;
  }

  applyStoreSettings(state.settings);
}

function saveDemoOrders() {
  localStorage.setItem('ilaundry_demo_orders', JSON.stringify(state.orders));
}

function saveDemoServices() {
  localStorage.setItem('ilaundry_demo_services', JSON.stringify(state.services));
}

function resetDemoData() {
  if (confirm('Reset ulang data demo ke kondisi awal (10 transaksi & 6 layanan contoh)?')) {
    initDemoStorage(true);
    renderCatalog();
    renderSimulationDropdown();
    renderOrderServiceDropdown();
    renderAdminOrdersTable(state.orders);
    updateAdminStats(state.orders);
    renderMonthlyRecap();
    renderServicesManagementTable();
    showToast('✨ Data demo berhasil di-reset ke kondisi awal!', 'success');
  }
}

// ============================================
// UI FEEDBACK & HELPERS
// ============================================

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button style="background:none;border:none;color:#fff;cursor:pointer;font-weight:700;margin-left:10px;" onclick="this.parentElement.remove()">&times;</button>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Number(number) || 0);
}

function formatIndonesianPhone(rawPhone) {
  let cleaned = String(rawPhone || '').replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}

// ============================================
// TAB NAVIGATION & AUTH
// ============================================

function switchTab(tabId) {
  state.currentTab = tabId;

  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.nav-links button').forEach(btn => btn.classList.remove('active'));

  const targetView = document.getElementById(`view-${tabId}`);
  const targetNav = document.getElementById(`nav-${tabId}`);

  if (targetView) targetView.classList.add('active');
  if (targetNav) targetNav.classList.add('active');

  // Toggle active pada mobile bottom nav
  document.querySelectorAll('.mobile-nav-btn').forEach(btn => btn.classList.remove('active'));
  const targetMobNav = document.getElementById(`mob-nav-${tabId}`);
  if (targetMobNav) targetMobNav.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (tabId === 'admin') {
    renderAdminOrdersTable(state.orders);
    updateAdminStats(state.orders);
  } else if (tabId === 'catalog') {
    renderCatalog();
    calculateSimulation();
  }
}

function isSuperAdmin() {
  return localStorage.getItem('ilaundry_demo_role') === 'superadmin';
}

function checkAdminAuth() {
  const isLogged = localStorage.getItem('ilaundry_demo_cashier_session') === 'logged_in';
  const isOwner = isSuperAdmin();
  const navOrder = document.getElementById('nav-item-order');
  const navAdmin = document.getElementById('nav-item-admin');
  const authContainer = document.getElementById('nav-auth-container');
  const btnSaPanel = document.getElementById('btn-superadmin-panel');

  const mobOrder = document.getElementById('mob-nav-order');
  const mobAdmin = document.getElementById('mob-nav-admin');
  const mobAuth = document.getElementById('mob-nav-auth');

  if (btnSaPanel) btnSaPanel.style.display = isOwner ? 'inline-flex' : 'none';

  if (isLogged) {
    if (navOrder) navOrder.style.display = 'block';
    if (navAdmin) navAdmin.style.display = 'block';
    if (mobOrder) mobOrder.style.display = 'flex';
    if (mobAdmin) mobAdmin.style.display = 'flex';
    if (mobAuth) {
      mobAuth.innerHTML = '<span class="mob-icon">🚪</span><span class="mob-label">Logout</span>';
      mobAuth.onclick = logoutAdmin;
    }
    if (authContainer) {
      const badgeHtml = isOwner 
        ? `<span class="badge-owner">👑 Super Admin</span>
           <button class="btn btn-secondary btn-sm" onclick="openSuperAdminModal()" style="font-weight:700; background:#fff7ed; border-color:#fdba74; color:#c2410c;">⚙️ Pengaturan</button>`
        : `<span style="font-size:0.8rem;color:var(--accent);font-weight:700;">🟢 Kasir Demo</span>`;

      authContainer.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;">
          ${badgeHtml}
          <button class="btn btn-secondary btn-sm" onclick="logoutAdmin()" style="font-size:0.75rem;padding:4px 8px;">Keluar</button>
        </div>
      `;
    }
  } else {
    if (navOrder) navOrder.style.display = 'none';
    if (navAdmin) navAdmin.style.display = 'none';
    if (mobOrder) mobOrder.style.display = 'none';
    if (mobAdmin) mobAdmin.style.display = 'none';
    if (mobAuth) {
      mobAuth.innerHTML = '<span class="mob-icon">🔑</span><span class="mob-label">Login</span>';
      mobAuth.onclick = openLoginModal;
    }
    if (authContainer) {
      authContainer.innerHTML = `
        <button id="btn-login-trigger" class="btn btn-secondary btn-sm" onclick="openLoginModal()" style="font-weight: 700;">
          🔑 Login Petugas Demo
        </button>
      `;
    }
    if (state.currentTab === 'order' || state.currentTab === 'admin') {
      switchTab('tracking');
    }
  }
}

function openLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.style.display = 'flex';
    const userInput = document.getElementById('login-username');
    const passInput = document.getElementById('login-password');
    if (userInput) userInput.value = 'admin';
    if (passInput) passInput.value = 'demo123';
  }
}

function closeLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) modal.style.display = 'none';
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const user = (document.getElementById('login-username').value || '').trim();
  const pass = (document.getElementById('login-password').value || '').trim();

  const validOwnerPass = String((state.settings && state.settings.super_admin_pass) || 'owner123').trim();

  if (user === 'owner' && (pass === validOwnerPass || pass === 'owner123')) {
    localStorage.setItem('ilaundry_demo_cashier_session', 'logged_in');
    localStorage.setItem('ilaundry_demo_role', 'superadmin');
    closeLoginModal();
    checkAdminAuth();
    showToast('👑 Berhasil masuk sebagai Super Admin (Owner)! Akses penuh aktif.', 'success');
    switchTab('admin');
  } else if (user === DEMO_CONFIG.DEMO_USER && (pass === DEMO_CONFIG.DEMO_PASS || pass === DEMO_CONFIG.DEMO_PASS_ALT || pass === 'admin' || pass === 'demo' || pass === '1234')) {
    localStorage.setItem('ilaundry_demo_cashier_session', 'logged_in');
    localStorage.setItem('ilaundry_demo_role', 'cashier');
    closeLoginModal();
    checkAdminAuth();
    showToast('✅ Berhasil masuk ke Panel Kasir Demo!', 'success');
    switchTab('admin');
  } else {
    showToast('⚠️ Username/Password salah! Kasir: admin/1234 | Super Admin: owner/owner123', 'error');
  }
}

function logoutAdmin() {
  localStorage.removeItem('ilaundry_demo_cashier_session');
  localStorage.removeItem('ilaundry_demo_role');
  checkAdminAuth();
  showToast('🔒 Akses kasir demo berhasil dikunci.', 'info');
  switchTab('tracking');
}

// ============================================
// VIEW 1: LACAK RESI (TRACKING)
// ============================================

function handleTrackSearch(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('track-input');
  const keyword = (input ? input.value : '').trim().toLowerCase();

  if (!keyword) {
    showToast('Masukkan nomor resi atau nomor WhatsApp!', 'warning');
    return;
  }

  const cleanDigits = keyword.replace(/\D/g, '');
  const matched = state.orders.filter(o => {
    const resi = String(o.id_pesanan || '').toLowerCase();
    const wa = String(o.no_whatsapp || '').replace(/\D/g, '');
    return resi.includes(keyword) || (cleanDigits && wa.endsWith(cleanDigits.slice(-8)));
  });

  renderTrackingResults(matched, keyword);
}

function renderTrackingResults(orders, keyword) {
  const container = document.getElementById('tracking-result-area');
  if (!container) return;

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 2.8rem; margin-bottom: 12px;">🔍</div>
        <h3 class="card-title">Pesanan Tidak Ditemukan</h3>
        <p class="card-subtitle">
          Tidak ditemukan pesanan dengan kata kunci "<strong>${keyword}</strong>".<br>
          <em>Tips Demo: Coba ketik resi contoh <strong>IL-2611-002</strong> atau nomor WA <strong>085211223344</strong>.</em>
        </p>
      </div>
    `;
    return;
  }

  let html = `<div style="display: flex; flex-direction: column; gap: 20px;">`;
  orders.forEach(order => {
    const curIdx = STATUS_STEPS.indexOf(order.status_cucian);
    const effectiveIdx = curIdx === -1 ? 0 : curIdx;

    let stepsHtml = '';
    STATUS_STEPS.forEach((step, idx) => {
      const isCompleted = idx < effectiveIdx;
      const isActive = idx === effectiveIdx;
      const stateClass = isCompleted ? 'completed' : (isActive ? 'active' : '');
      const icon = isCompleted ? '✓' : (idx + 1);

      stepsHtml += `
        <div class="step-item ${stateClass}">
          <div class="step-circle">${icon}</div>
          <div class="step-title">${step}</div>
        </div>
      `;
    });

    const isLunas = (order.status_bayar || '').toLowerCase() === 'lunas';

    html += `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
          <div>
            <span class="badge badge-primary" style="font-size: 0.9rem; padding: 5px 12px;">${order.id_pesanan}</span>
            <h2 style="font-size: 1.3rem; margin-top: 8px; color: var(--dark);">${order.nama_pelanggan}</h2>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Masuk: ${formatDateTime(order.timestamp)}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 1.35rem; font-weight: 800; color: var(--primary);">${formatRupiah(order.total_biaya)}</div>
            <span class="badge ${isLunas ? 'badge-success' : 'badge-danger'}" style="margin-top: 4px;">
              ${order.status_bayar || 'Belum Lunas'}
            </span>
          </div>
        </div>

        <div class="stepper" style="margin-bottom: 25px;">
          ${stepsHtml}
        </div>

        <div style="background: var(--bg-page); padding: 15px; border-radius: var(--radius-md); border: 1px solid var(--border); font-size: 0.9rem;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
            <div><strong>Paket Layanan:</strong> ${order.layanan}</div>
            <div><strong>Jumlah / Bobot:</strong> ${order.jumlah}</div>
            <div><strong>Status Saat Ini:</strong> <span class="badge badge-primary">${order.status_cucian}</span></div>
            <div><strong>Catatan:</strong> ${order.catatan || '-'}</div>
          </div>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}

// ============================================
// VIEW 2: KATALOG & SIMULATOR TARIF
// ============================================

function getServiceIcon(name = '', jenis = '') {
  const n = String(name || '').toLowerCase();
  if (n.includes('express') || n.includes('kilat')) return '⚡';
  if (n.includes('sepatu') || n.includes('sneakers')) return '👟';
  if (n.includes('bedcover') || n.includes('selimut') || n.includes('sprei')) return '🛏️';
  if (n.includes('setrika')) return '👔';
  if (n.includes('jas') || n.includes('blazer') || n.includes('premium')) return '🧥';
  if (n.includes('karpet')) return '🧶';
  if (n.includes('gorden')) return '🪟';
  if (jenis === 'Kiloan') return '🧺';
  return '✨';
}

function selectServiceForSimulator(serviceId) {
  const select = document.getElementById('sim-layanan');
  if (select) {
    select.value = serviceId;
    calculateSimulation();
    window.scrollTo({ top: 160, behavior: 'smooth' });
    const s = state.services.find(item => item.id === serviceId);
    showToast(`🧮 Menghitung estimasi untuk: ${s ? s.nama_layanan : ''}`, 'info');
  }
}

function renderCatalog() {
  const container = document.getElementById('catalog-container');
  if (!container) return;

  if (state.services.length === 0) {
    container.innerHTML = `<div style="text-align:center;grid-column:1/-1;">Katalog kosong.</div>`;
    return;
  }

  let html = '';
  state.services.forEach(item => {
    const icon = getServiceIcon(item.nama_layanan, item.jenis);
    html += `
      <div class="service-card" onclick="selectServiceForSimulator('${item.id}')" style="cursor: pointer;" title="Klik untuk simulasi hitung biaya">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
          <span class="badge ${item.jenis === 'Kiloan' ? 'badge-primary' : 'badge-warning'} service-badge">
            ${item.jenis || 'Layanan'}
          </span>
          <span style="font-size: 1.6rem; line-height: 1;">${icon}</span>
        </div>
        <h3 class="service-name" style="margin-bottom: 6px;">${item.nama_layanan}</h3>
        <div class="service-price" style="font-size: 1.25rem; margin-bottom: 10px;">
          ${formatRupiah(item.harga)} <span class="service-unit">/ ${item.satuan}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--text-muted); border-top: 1px dashed var(--border); padding-top: 8px;">
          <span>⏱️ ${item.estimasi_hari || 1} Hari Kerja</span>
          <span style="color: var(--primary); font-weight: 700;">Hitung ➜</span>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function renderSimulationDropdown() {
  const select = document.getElementById('sim-layanan');
  if (!select) return;
  select.innerHTML = '';
  state.services.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = `${s.nama_layanan} (${formatRupiah(s.harga)} / ${s.satuan})`;
    select.appendChild(opt);
  });
  calculateSimulation();
}

function calculateSimulation() {
  const select = document.getElementById('sim-layanan');
  const qtyInput = document.getElementById('sim-qty');
  const totalDisplay = document.getElementById('sim-total');
  const unitLabel = document.getElementById('sim-unit-label');

  if (!select || !qtyInput || !totalDisplay) return;

  const selectedService = state.services.find(s => s.id === select.value);
  if (!selectedService) return;

  if (unitLabel) unitLabel.textContent = selectedService.satuan || 'Kg';
  const qty = parseFloat(qtyInput.value) || 0;
  const total = qty * Number(selectedService.harga || 0);
  totalDisplay.textContent = formatRupiah(total);
}

// ============================================
// VIEW 3: INPUT ORDER BARU (KASIR)
// ============================================

function renderOrderServiceDropdown() {
  const select = document.getElementById('order-layanan');
  if (!select) return;
  select.innerHTML = '<option value="">-- Pilih Layanan --</option>';
  state.services.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = `${s.nama_layanan} — ${formatRupiah(s.harga)} / ${s.satuan}`;
    select.appendChild(opt);
  });
}

function handleOrderServiceChange() {
  const select = document.getElementById('order-layanan');
  const unitLabel = document.getElementById('order-unit-label');
  if (!select) return;

  const s = state.services.find(item => item.id === select.value);
  if (s && unitLabel) {
    unitLabel.textContent = s.satuan || 'Kg';
  }
  calculateOrderTotal();
}

function calculateOrderTotal() {
  const select = document.getElementById('order-layanan');
  const qtyInput = document.getElementById('order-qty');
  const preview = document.getElementById('order-total-preview');
  if (!select || !qtyInput || !preview) return;

  const s = state.services.find(item => item.id === select.value);
  if (!s) {
    preview.textContent = 'Rp 0';
    return 0;
  }

  const qty = parseFloat(qtyInput.value) || 0;
  const total = qty * Number(s.harga || 0);
  preview.textContent = formatRupiah(total);
  return total;
}

// ============================================
// AUTOCOMPLETE PELANGGAN (MINIMAL 3 KARAKTER)
// ============================================

function handleCustomerNameInput(val) {
  const dropdown = document.getElementById('customer-suggestions');
  if (!dropdown) return;

  const query = String(val || '').trim().toLowerCase();
  if (query.length < 3) {
    dropdown.style.display = 'none';
    dropdown.innerHTML = '';
    return;
  }

  const matches = (state.customers || []).filter(c => 
    String(c.nama_pelanggan || '').toLowerCase().includes(query)
  );

  if (matches.length === 0) {
    dropdown.style.display = 'none';
    dropdown.innerHTML = '';
    return;
  }

  dropdown.innerHTML = matches.slice(0, 6).map(c => `
    <div class="autocomplete-item" onclick="selectCustomerSuggestion('${c.nama_pelanggan.replace(/'/g, "\\'")}', '${(c.no_whatsapp || '').replace(/'/g, "\\'")}')">
      <div>
        <div class="autocomplete-name">👤 ${c.nama_pelanggan}</div>
        <div class="autocomplete-phone">📱 ${c.no_whatsapp || '-'}</div>
      </div>
      <span class="autocomplete-count">${c.total_orders || 1}x order</span>
    </div>
  `).join('');

  dropdown.style.display = 'block';
}

function selectCustomerSuggestion(name, phone) {
  const nameInput = document.getElementById('order-nama');
  const waInput = document.getElementById('order-wa');
  const dropdown = document.getElementById('customer-suggestions');

  if (nameInput) nameInput.value = name;
  if (waInput) waInput.value = phone;
  if (dropdown) dropdown.style.display = 'none';

  showToast(`Data pelanggan "${name}" berhasil diisi otomatis!`, 'info');
}

// Menutup dropdown autocomplete jika user klik di luar area
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('customer-suggestions');
  const nameInput = document.getElementById('order-nama');
  if (dropdown && e.target !== nameInput && !dropdown.contains(e.target)) {
    dropdown.style.display = 'none';
  }
});

// ============================================
// LOGIKA WAKTU & METODE PEMBAYARAN FORM ORDER
// ============================================

function selectPayTiming(timing) {
  state.currentOrderPayTiming = timing;
  const cardLunas = document.getElementById('timing-card-lunas');
  const cardBelum = document.getElementById('timing-card-belum');
  const radioLunas = document.getElementById('pay-timing-lunas');
  const radioBelum = document.getElementById('pay-timing-belum');
  const payArea = document.getElementById('order-pay-methods-area');
  const timingBadge = document.getElementById('order-timing-badge');

  if (timing === 'Lunas') {
    if (cardLunas) cardLunas.classList.add('active');
    if (cardBelum) cardBelum.classList.remove('active');
    if (radioLunas) radioLunas.checked = true;
    if (payArea) payArea.style.display = 'block';
    if (timingBadge) {
      timingBadge.textContent = 'Bayar Sekarang (Lunas)';
      timingBadge.className = 'badge badge-success';
    }
  } else {
    if (cardLunas) cardLunas.classList.remove('active');
    if (cardBelum) cardBelum.classList.add('active');
    if (radioBelum) radioBelum.checked = true;
    if (payArea) payArea.style.display = 'none';
    if (timingBadge) {
      timingBadge.textContent = 'Bayar Saat Ambil (Belum Lunas)';
      timingBadge.className = 'badge badge-warning';
    }
  }
}

function selectPayMethod(method) {
  state.currentOrderPayMethod = method;
  ['cash', 'qris', 'transfer'].forEach(m => {
    const btn = document.getElementById(`pay-btn-${m}`);
    const box = document.getElementById(`order-${m}-detail-box`);
    if (btn) {
      if (m === method.toLowerCase()) btn.classList.add('active');
      else btn.classList.remove('active');
    }
    if (box) {
      box.style.display = m === method.toLowerCase() ? 'block' : 'none';
    }
  });

  const total = calculateOrderTotal();
  if (method === 'QRIS') {
    const totalText = document.getElementById('order-qris-total-text');
    if (totalText) totalText.textContent = formatRupiah(total);
    refreshQrisDisplay();
  } else if (method === 'TRANSFER') {
    refreshBankDisplay();
  } else if (method === 'CASH') {
    calculateOrderChange();
  }
}

function calculateOrderChange() {
  const total = calculateOrderTotal();
  const input = document.getElementById('order-cash-nominal');
  const preview = document.getElementById('order-change-preview');
  const statusBadge = document.getElementById('order-change-status');
  if (!input || !preview) return;

  const cash = Number(input.value) || 0;
  if (!input.value) {
    preview.textContent = 'Rp 0';
    if (statusBadge) {
      statusBadge.textContent = 'Masukkan Nominal';
      statusBadge.className = 'badge badge-gray';
    }
    return;
  }

  const change = cash - total;
  if (change < 0) {
    preview.textContent = `- ${formatRupiah(Math.abs(change))}`;
    preview.style.color = '#dc2626';
    if (statusBadge) {
      statusBadge.textContent = 'Kurang ' + formatRupiah(Math.abs(change));
      statusBadge.className = 'badge badge-danger';
    }
  } else if (change === 0) {
    preview.textContent = 'Rp 0';
    preview.style.color = '#15803d';
    if (statusBadge) {
      statusBadge.textContent = 'Uang Pas';
      statusBadge.className = 'badge badge-success';
    }
  } else {
    preview.textContent = formatRupiah(change);
    preview.style.color = '#15803d';
    if (statusBadge) {
      statusBadge.textContent = 'Kembalian ' + formatRupiah(change);
      statusBadge.className = 'badge badge-success';
    }
  }
}

function setQuickCash(type) {
  const total = calculateOrderTotal();
  const input = document.getElementById('order-cash-nominal');
  if (!input) return;

  if (type === 'exact') {
    input.value = total;
  } else if (typeof type === 'number') {
    if (type >= total) {
      input.value = type;
    } else {
      input.value = Math.ceil(total / type) * type;
    }
  }
  calculateOrderChange();
}

function handleCreateOrder(e) {
  e.preventDefault();
  const nama = (document.getElementById('order-nama').value || '').trim();
  const wa = (document.getElementById('order-wa').value || '').trim();
  const serviceId = document.getElementById('order-layanan').value;
  const qty = parseFloat(document.getElementById('order-qty').value) || 1;
  const catatan = (document.getElementById('order-catatan').value || '').trim();

  const service = state.services.find(s => s.id === serviceId);
  if (!service) {
    showToast('Pilih jenis layanan terlebih dahulu!', 'warning');
    return;
  }

  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = ('0' + (now.getMonth() + 1)).slice(-2);
  const counter = ('000' + (state.orders.length + 1)).slice(-3);
  const newResi = `IL-${yy}${mm}-${counter}`;

  const total = qty * Number(service.harga || 0);
  const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);

  const payTiming = state.currentOrderPayTiming || 'Lunas';
  const payMethod = state.currentOrderPayMethod || 'CASH';

  let nominalBayar = 0;
  let kembalian = 0;

  if (payTiming === 'Lunas') {
    if (payMethod === 'CASH') {
      const cashInputVal = Number(document.getElementById('order-cash-nominal').value) || 0;
      if (cashInputVal < total) {
        showToast('Uang tunai yang diterima kurang dari total biaya!', 'error');
        return;
      }
      nominalBayar = cashInputVal;
      kembalian = cashInputVal - total;
    } else {
      nominalBayar = total;
      kembalian = 0;
    }
  }

  const newOrder = {
    id_pesanan: newResi,
    timestamp: timestamp,
    nama_pelanggan: nama,
    no_whatsapp: wa,
    layanan: service.nama_layanan,
    jumlah: qty,
    total_biaya: total,
    status_cucian: 'Diterima',
    status_bayar: payTiming,
    metode_bayar: payTiming === 'Lunas' ? payMethod : '-',
    nominal_bayar: nominalBayar,
    kembalian: kembalian,
    catatan: catatan
  };

  // Simpan ke state & LocalStorage
  state.orders.unshift(newOrder);
  saveDemoOrders();

  // Update customer database
  const existingCust = (state.customers || []).find(c => c.nama_pelanggan.toLowerCase() === nama.toLowerCase());
  if (existingCust) {
    existingCust.total_orders = (existingCust.total_orders || 1) + 1;
    if (wa) existingCust.no_whatsapp = wa;
  } else {
    state.customers.push({
      nama_pelanggan: nama,
      no_whatsapp: wa,
      total_orders: 1
    });
  }
  localStorage.setItem('ilaundry_demo_customers', JSON.stringify(state.customers));

  // Reset form
  document.getElementById('order-form').reset();
  selectPayTiming('Lunas');
  selectPayMethod('CASH');
  calculateOrderTotal();

  // Tampilkan notifikasi simulasi Fonnte
  showToast(`✨ [Simulasi Demo] Pesanan ${newResi} berhasil dibuat via ${newOrder.metode_bayar}! Notifikasi WA disimulasikan ke ${wa}.`, 'success');

  // Buka nota thermal otomatis
  openReceiptModal(newOrder);
  updateAdminStats(state.orders);
  renderAdminOrdersTable(state.orders);
  renderDailySales();
}

// ============================================
// VIEW 4: PANEL KASIR & REKAP BULANAN
// ============================================

function switchAdminSubView(subView) {
  const btnOrders = document.getElementById('sub-nav-orders');
  const btnDaily = document.getElementById('sub-nav-daily');
  const btnRecap = document.getElementById('sub-nav-recap');
  
  const secOrders = document.getElementById('admin-sub-orders');
  const secDaily = document.getElementById('admin-sub-daily');
  const secRecap = document.getElementById('admin-sub-recap');

  if (btnOrders) btnOrders.className = 'btn btn-secondary';
  if (btnDaily) btnDaily.className = 'btn btn-secondary';
  if (btnRecap) btnRecap.className = 'btn btn-secondary';

  if (secOrders) secOrders.style.display = 'none';
  if (secDaily) secDaily.style.display = 'none';
  if (secRecap) secRecap.style.display = 'none';

  if (subView === 'orders') {
    if (btnOrders) btnOrders.className = 'btn btn-primary';
    if (secOrders) secOrders.style.display = 'block';
    renderAdminOrdersTable(state.orders);
    updateAdminStats(state.orders);
  } else if (subView === 'daily') {
    if (btnDaily) btnDaily.className = 'btn btn-primary';
    if (secDaily) secDaily.style.display = 'block';
    initDailyDatePicker();
    renderDailySales();
  } else if (subView === 'recap') {
    if (btnRecap) btnRecap.className = 'btn btn-primary';
    if (secRecap) secRecap.style.display = 'block';
    renderMonthlyRecap();
  }
}

// ============================================
// CATATAN PENJUALAN HARIAN (DEMO SANDBOX)
// ============================================

function extractOrderDate(timestampStr) {
  if (!timestampStr) return '';
  const s = String(timestampStr).trim();

  const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymd) return `${ymd[1]}-${ymd[2]}-${ymd[3]}`;

  const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dmy) {
    const dd = ('0' + dmy[1]).slice(-2);
    const mm = ('0' + dmy[2]).slice(-2);
    return `${dmy[3]}-${mm}-${dd}`;
  }

  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${y}-${m}-${day}`;
  }

  return '';
}

function extractOrderTime(timestampStr) {
  if (!timestampStr) return '-';
  const s = String(timestampStr).trim();

  const timeMatch = s.match(/(\d{2}:\d{2})(?::\d{2})?/);
  if (timeMatch) return `${timeMatch[1]} WIB`;

  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const h = ('0' + d.getHours()).slice(-2);
    const m = ('0' + d.getMinutes()).slice(-2);
    return `${h}:${m} WIB`;
  }
  return '-';
}

function getLocalDateString(dateObj) {
  const y = dateObj.getFullYear();
  const m = ('0' + (dateObj.getMonth() + 1)).slice(-2);
  const d = ('0' + dateObj.getDate()).slice(-2);
  return `${y}-${m}-${d}`;
}

function initDailyDatePicker() {
  const dateInput = document.getElementById('daily-filter-date');
  if (!dateInput) return;
  if (!dateInput.value) {
    if (state.orders.length > 0 && state.orders[0].timestamp) {
      const latestDate = extractOrderDate(state.orders[0].timestamp);
      dateInput.value = latestDate || getLocalDateString(new Date());
    } else {
      dateInput.value = getLocalDateString(new Date());
    }
  }
}

function setDailyDateFilter(type) {
  const dateInput = document.getElementById('daily-filter-date');
  if (!dateInput) return;

  const now = new Date();
  if (type === 'today') {
    dateInput.value = getLocalDateString(now);
  } else if (type === 'yesterday') {
    const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    dateInput.value = getLocalDateString(yesterday);
  }
  renderDailySales();
}

function renderDailySales() {
  const dateInput = document.getElementById('daily-filter-date');
  if (!dateInput) return;

  let targetDate = dateInput.value;
  if (!targetDate) {
    targetDate = getLocalDateString(new Date());
    dateInput.value = targetDate;
  }

  const badgeDate = document.getElementById('daily-badge-date');
  const tableTitle = document.getElementById('daily-table-title');

  const parts = targetDate.split('-');
  let readableDate = targetDate;
  if (parts.length === 3) {
    const dObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (!isNaN(dObj.getTime())) {
      readableDate = dObj.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  }

  if (badgeDate) badgeDate.textContent = readableDate;
  if (tableTitle) tableTitle.textContent = `Daftar Penjualan: ${readableDate}`;

  const dailyOrders = state.orders.filter(o => extractOrderDate(o.timestamp) === targetDate);

  let totalOmset = 0;
  let totalPaid = 0;
  let totalUnpaid = 0;
  let totalQty = 0;

  dailyOrders.forEach(o => {
    const amount = Number(o.total_biaya) || 0;
    const qty = Number(o.jumlah) || 1;
    totalOmset += amount;
    totalQty += qty;

    const isLunas = String(o.status_bayar || '').toLowerCase() === 'lunas';
    if (isLunas) {
      totalPaid += amount;
    } else {
      totalUnpaid += amount;
    }
  });

  const omsetEl = document.getElementById('daily-stat-omset');
  const paidEl = document.getElementById('daily-stat-paid');
  const unpaidEl = document.getElementById('daily-stat-unpaid');
  const countQtyEl = document.getElementById('daily-stat-count-qty');

  if (omsetEl) omsetEl.textContent = formatRupiah(totalOmset);
  if (paidEl) paidEl.textContent = formatRupiah(totalPaid);
  if (unpaidEl) unpaidEl.textContent = formatRupiah(totalUnpaid);
  if (countQtyEl) countQtyEl.textContent = `${dailyOrders.length} Nota (${totalQty.toFixed(1)} Satuan)`;

  const tbody = document.getElementById('daily-orders-tbody');
  const tfoot = document.getElementById('daily-orders-tfoot');

  if (tbody) {
    if (dailyOrders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 35px 20px;">
            <div style="font-size: 2.2rem; margin-bottom: 8px;">📭</div>
            <div style="font-weight: 700; color: var(--dark); font-size: 1rem;">Tidak Ada Transaksi pada ${readableDate}</div>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
              Silakan pilih tanggal lain di atas atau buat pesanan baru di menu Order Baru.
            </p>
          </td>
        </tr>
      `;
      if (tfoot) tfoot.innerHTML = '';
      return;
    }

    let rowsHtml = '';
    dailyOrders.forEach(o => {
      const isLunas = String(o.status_bayar || '').toLowerCase() === 'lunas';
      const timeStr = extractOrderTime(o.timestamp);

      rowsHtml += `
        <tr>
          <td><strong>${o.id_pesanan}</strong></td>
          <td style="font-size: 0.85rem; white-space: nowrap;">
            <span style="background: var(--bg-page); padding: 2px 7px; border-radius: 4px; border: 1px solid var(--border); font-weight: 600;">
              ⏰ ${timeStr}
            </span>
          </td>
          <td>
            <div style="font-weight: 700;">${o.nama_pelanggan}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${o.no_whatsapp || '-'}</div>
          </td>
          <td>
            <div>${o.layanan}</div>
            <small style="color: var(--text-muted);">${o.jumlah}</small>
          </td>
          <td style="font-weight: 700; color: var(--primary);">${formatRupiah(o.total_biaya)}</td>
          <td>
            <button class="badge ${isLunas ? 'badge-success' : 'badge-danger'}" 
                    style="cursor: pointer; border: none;"
                    onclick="updatePaymentStatusQuick('${o.id_pesanan}', '${isLunas ? 'Belum Lunas' : 'Lunas'}')"
                    title="Klik untuk ubah status pembayaran">
              ${o.status_bayar || 'Belum Lunas'} 🔄
            </button>
          </td>
          <td>
            <span class="badge badge-primary">${o.status_cucian}</span>
          </td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="openReceiptByResi('${o.id_pesanan}')" title="Cetak Struk 58mm">
              🖨️ Struk
            </button>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = rowsHtml;

    if (tfoot) {
      tfoot.innerHTML = `
        <tr>
          <td colspan="4" style="padding: 14px 16px; text-align: right; font-weight: 800; font-size: 0.95rem;">
            TOTAL OMSET (${dailyOrders.length} Nota):
          </td>
          <td style="padding: 14px 16px; color: var(--primary); font-size: 1.15rem; font-weight: 800;">
            ${formatRupiah(totalOmset)}
          </td>
          <td colspan="3" style="padding: 14px 16px; font-size: 0.88rem;">
            <span style="color: var(--accent); font-weight: 700;">Lunas: ${formatRupiah(totalPaid)}</span> • 
            <span style="color: var(--warning); font-weight: 700;">Piutang: ${formatRupiah(totalUnpaid)}</span>
          </td>
        </tr>
      `;
    }
  }
}

function downloadDailyCsv() {
  const dateInput = document.getElementById('daily-filter-date');
  const targetDate = dateInput ? dateInput.value : '';
  const dailyOrders = state.orders.filter(o => extractOrderDate(o.timestamp) === targetDate);

  if (dailyOrders.length === 0) {
    showToast('Tidak ada data transaksi pada tanggal ini untuk diunduh.', 'warning');
    return;
  }

  let csv = 'data:text/csv;charset=utf-8,No Resi,Waktu,Pelanggan,WhatsApp,Layanan,Jumlah,Total Biaya,Status Bayar,Status Cucian,Catatan\n';
  dailyOrders.forEach(o => {
    csv += `"${o.id_pesanan}","${o.timestamp}","${o.nama_pelanggan}","${o.no_whatsapp}","${o.layanan}","${o.jumlah}","${o.total_biaya}","${o.status_bayar}","${o.status_cucian}","${o.catatan || ''}"\n`;
  });

  const encoded = encodeURI(csv);
  const link = document.createElement('a');
  link.setAttribute('href', encoded);
  link.setAttribute('download', `penjualan-harian-demo-${targetDate}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast(`📥 Berkas CSV Penjualan Harian (${targetDate}) berhasil diunduh!`, 'success');
}

function updateAdminStats(orders) {
  const totalEl = document.getElementById('stat-total');
  const activeEl = document.getElementById('stat-active');
  const readyEl = document.getElementById('stat-ready');
  const revenueEl = document.getElementById('stat-revenue');

  let totalCount = orders.length;
  let activeCount = 0;
  let readyCount = 0;
  let totalRevenue = 0;

  orders.forEach(o => {
    const st = (o.status_cucian || '').toLowerCase();
    if (st !== 'selesai') activeCount++;
    if (st === 'siap diambil') readyCount++;
    totalRevenue += Number(o.total_biaya || 0);
  });

  if (totalEl) totalEl.textContent = totalCount;
  if (activeEl) activeEl.textContent = activeCount;
  if (readyEl) readyEl.textContent = readyCount;
  if (revenueEl) revenueEl.textContent = formatRupiah(totalRevenue);
}

function filterAdminOrders() {
  const search = (document.getElementById('admin-search-input').value || '').toLowerCase();
  const filterSt = document.getElementById('admin-status-filter').value;

  const filtered = state.orders.filter(o => {
    const matchSearch = String(o.id_pesanan || '').toLowerCase().includes(search) ||
                        String(o.nama_pelanggan || '').toLowerCase().includes(search) ||
                        String(o.no_whatsapp || '').includes(search);
    const matchStatus = filterSt === 'ALL' || o.status_cucian === filterSt;
    return matchSearch && matchStatus;
  });

  renderAdminOrdersTable(filtered);
}

function renderAdminOrdersTable(orders) {
  const tbody = document.getElementById('admin-orders-tbody');
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:25px;">Tidak ada transaksi ditemukan.</td></tr>`;
    return;
  }

  let html = '';
  orders.forEach(order => {
    const isLunas = (order.status_bayar || '').toLowerCase() === 'lunas';
    html += `
      <tr>
        <td><strong>${order.id_pesanan}</strong></td>
        <td style="font-size:0.85rem;white-space:nowrap;">${formatDateTime(order.timestamp)}</td>
        <td>
          <div style="font-weight:700;">${order.nama_pelanggan}</div>
          <div style="font-size:0.8rem;color:var(--text-muted);">${order.no_whatsapp || '-'}</div>
        </td>
        <td>${order.layanan} <br><small style="color:var(--text-muted);">${order.jumlah}</small></td>
        <td style="font-weight:700;color:var(--primary);">${formatRupiah(order.total_biaya)}</td>
        <td>
          ${isLunas ? `
            <div>
              <span class="badge badge-success" style="font-size:0.75rem;">✓ Lunas</span>
              <small style="display:block; color:var(--text-muted); font-size:0.72rem; margin-top:2px;">${order.metode_bayar || 'CASH'}</small>
            </div>
          ` : `
            <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-start;">
              <span class="badge badge-danger" style="font-size:0.75rem;">Belum Lunas</span>
              <button class="btn btn-sm" style="background:#10b981; color:#fff; font-size:0.72rem; padding:2px 8px; font-weight:700;" 
                      onclick="openSettlementModal('${order.id_pesanan}')"
                      title="Pelunasan pembayaran saat cucian diambil">
                💰 Pelunasan
              </button>
            </div>
          `}
        </td>
        <td>
          <select style="font-size:0.82rem;padding:4px 6px;border-radius:6px;border:1px solid var(--border);"
                  onchange="updateOrderStatusQuick('${order.id_pesanan}', this.value)">
            ${STATUS_STEPS.map(st => `<option value="${st}" ${order.status_cucian === st ? 'selected' : ''}>${st}</option>`).join('')}
          </select>
        </td>
        <td>
          <div style="display:flex;gap:5px;">
            <button class="btn btn-secondary btn-sm" onclick="openReceiptByResi('${order.id_pesanan}')" title="Cetak Nota 58mm">
              🖨️ Struk
            </button>
          </div>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

function updateOrderStatusQuick(resi, newStatus) {
  const o = state.orders.find(item => item.id_pesanan === resi);
  if (!o) return;

  o.status_cucian = newStatus;
  saveDemoOrders();
  updateAdminStats(state.orders);

  if (newStatus === 'Siap Diambil') {
    showToast(`🔔 [Simulasi WA Fonnte] Notifikasi terkirim ke ${o.nama_pelanggan} (${o.no_whatsapp}): Cucian sudah siap diambil!`, 'info');
  } else {
    showToast(`Status ${resi} diubah menjadi "${newStatus}"`, 'success');
  }
}

function updatePaymentStatusQuick(resi, newPayment) {
  const o = state.orders.find(item => item.id_pesanan === resi);
  if (!o) return;

  o.status_bayar = newPayment;
  saveDemoOrders();
  renderAdminOrdersTable(state.orders);
  renderDailySales();
  showToast(`Status bayar ${resi} diperbarui menjadi "${newPayment}"`, 'success');
}

// ============================================
// REKAP BULANAN & ANALISIS PENJUALAN
// ============================================

function renderMonthlyRecap() {
  const monthSelect = document.getElementById('recap-filter-month');
  const yearSelect = document.getElementById('recap-filter-year');
  if (!monthSelect || !yearSelect) return;

  if (yearSelect.options.length === 0) {
    const curYear = new Date().getFullYear();
    yearSelect.innerHTML = `
      <option value="ALL">Semua Tahun</option>
      <option value="${curYear}" selected>${curYear}</option>
      <option value="${curYear - 1}">${curYear - 1}</option>
    `;
  }

  const selectedMonth = monthSelect.value;
  const selectedYear = yearSelect.value;

  const filtered = state.orders.filter(o => {
    if (!o.timestamp) return true;
    const d = new Date(o.timestamp);
    if (isNaN(d.getTime())) return true;

    const m = ('0' + (d.getMonth() + 1)).slice(-2);
    const y = String(d.getFullYear());

    const matchM = selectedMonth === 'ALL' || m === selectedMonth;
    const matchY = selectedYear === 'ALL' || y === selectedYear;
    return matchM && matchY;
  });

  let totalOmset = 0;
  let totalQty = 0;
  const serviceStats = {};

  filtered.forEach(o => {
    const total = Number(o.total_biaya || 0);
    const qty = Number(o.jumlah || 0);
    totalOmset += total;
    totalQty += qty;

    const sName = o.layanan || 'Lainnya';
    if (!serviceStats[sName]) {
      serviceStats[sName] = { count: 0, revenue: 0, qty: 0 };
    }
    serviceStats[sName].count += 1;
    serviceStats[sName].revenue += total;
    serviceStats[sName].qty += qty;
  });

  const omsetEl = document.getElementById('recap-stat-omset');
  const countEl = document.getElementById('recap-stat-count');
  const qtyEl = document.getElementById('recap-stat-qty');
  const favEl = document.getElementById('recap-stat-fav');

  if (omsetEl) omsetEl.textContent = formatRupiah(totalOmset);
  if (countEl) countEl.textContent = filtered.length;
  if (qtyEl) qtyEl.textContent = `${totalQty.toFixed(1)} Unit`;

  const sortedServices = Object.keys(serviceStats)
    .map(name => ({ name, ...serviceStats[name] }))
    .sort((a, b) => b.count - a.count);

  if (favEl) {
    favEl.textContent = sortedServices.length > 0 ? sortedServices[0].name : '-';
  }

  // Render Leaderboard Visual
  const leaderboardContainer = document.getElementById('recap-leaderboard-container');
  if (leaderboardContainer) {
    if (sortedServices.length === 0) {
      leaderboardContainer.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);">Tidak ada transaksi pada periode ini.</div>`;
    } else {
      const maxCount = sortedServices[0].count || 1;
      let boardHtml = '';

      sortedServices.forEach((s, idx) => {
        const pct = Math.round((s.count / maxCount) * 100);
        const rankClass = idx === 0 ? 'rank-1' : (idx === 1 ? 'rank-2' : (idx === 2 ? 'rank-3' : 'rank-other'));

        boardHtml += `
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;flex-wrap:wrap;gap:8px;">
              <div style="display:flex;align-items:center;gap:10px;">
                <span class="ranking-badge ${rankClass}">#${idx + 1}</span>
                <strong style="color:var(--dark);">${s.name}</strong>
              </div>
              <div style="font-size:0.85rem;color:var(--text-muted);">
                <strong style="color:var(--primary);">${s.count} Order</strong> (${s.qty.toFixed(1)} Satuan) • ${formatRupiah(s.revenue)}
              </div>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${pct}%;"></div>
            </div>
          </div>
        `;
      });
      leaderboardContainer.innerHTML = boardHtml;
    }
  }

  // Render Tabel Rincian Rekap
  const recapTbody = document.getElementById('recap-table-tbody');
  if (recapTbody) {
    if (sortedServices.length === 0) {
      recapTbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;">Tidak ada transaksi pada periode ini.</td></tr>`;
    } else {
      let rHtml = '';
      sortedServices.forEach((s, idx) => {
        const share = totalOmset > 0 ? ((s.revenue / totalOmset) * 100).toFixed(1) : '0';
        const sObj = state.services.find(item => item.nama_layanan === s.name);
        const kategori = sObj ? sObj.jenis : 'Layanan';

        rHtml += `
          <tr>
            <td><strong>#${idx + 1}</strong></td>
            <td><strong>${s.name}</strong></td>
            <td><span class="badge badge-primary">${kategori}</span></td>
            <td>${s.count} Transaksi</td>
            <td>${s.qty.toFixed(1)} Satuan</td>
            <td style="font-weight:700;color:var(--primary);">${formatRupiah(s.revenue)}</td>
            <td><span class="badge badge-success">${share}%</span></td>
          </tr>
        `;
      });
      recapTbody.innerHTML = rHtml;
    }
  }
}

function downloadRecapCsv() {
  let csvContent = 'data:text/csv;charset=utf-8,No Resi,Tanggal,Pelanggan,WhatsApp,Layanan,Jumlah,Total Biaya,Status Bayar,Status Cucian\n';
  state.orders.forEach(o => {
    csvContent += `"${o.id_pesanan}","${o.timestamp}","${o.nama_pelanggan}","${o.no_whatsapp}","${o.layanan}","${o.jumlah}","${o.total_biaya}","${o.status_bayar}","${o.status_cucian}"\n`;
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `rekap-laundry-demo-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('📥 Berkas CSV rekap berhasil diunduh!', 'success');
}

// ============================================
// MODAL CETAK NOTA THERMAL 58MM
// ============================================

function openReceiptByResi(resi) {
  const o = state.orders.find(item => item.id_pesanan === resi);
  if (o) openReceiptModal(o);
}

function openReceiptModal(order) {
  const modal = document.getElementById('receipt-modal');
  if (!modal) return;

  const rcpId = document.getElementById('rcp-id');
  const rcpDate = document.getElementById('rcp-date');
  const rcpCust = document.getElementById('rcp-cust');
  const rcpWa = document.getElementById('rcp-wa');
  const rcpService = document.getElementById('rcp-service');
  const rcpQty = document.getElementById('rcp-qty');
  const rcpTotal = document.getElementById('rcp-total');
  const rcpPay = document.getElementById('rcp-pay-status');
  const rcpNotes = document.getElementById('rcp-notes');
  const rcpPhone = document.getElementById('rcp-cs-phone');
  const rcpUrl = document.getElementById('rcp-direct-url');
  const rcpQr = document.getElementById('rcp-qr-img');

  if (rcpId) rcpId.textContent = order.id_pesanan;
  if (rcpDate) rcpDate.textContent = formatDateTime(order.timestamp);
  if (rcpCust) rcpCust.textContent = order.nama_pelanggan;
  if (rcpWa) rcpWa.textContent = order.no_whatsapp || '-';
  if (rcpService) rcpService.textContent = order.layanan;
  if (rcpQty) rcpQty.textContent = `${order.jumlah} Unit`;
  if (rcpTotal) rcpTotal.textContent = formatRupiah(order.total_biaya);
  if (rcpPay) rcpPay.textContent = order.status_bayar || 'Belum Lunas';
  if (rcpPay) rcpPay.style.color = order.status_bayar === 'Lunas' ? '#10b981' : '#dc2626';

  const method = order.metode_bayar || (order.status_bayar === 'Lunas' ? 'CASH' : '-');
  const elMethod = document.getElementById('rcp-pay-method');
  const rowMethod = document.getElementById('rcp-row-method');
  if (elMethod) elMethod.textContent = method;
  if (rowMethod) rowMethod.style.display = method !== '-' ? 'flex' : 'none';

  const rowCash = document.getElementById('rcp-row-cash');
  const elCash = document.getElementById('rcp-pay-cash');
  if (rowCash && elCash) {
    if (order.nominal_bayar && Number(order.nominal_bayar) > 0) {
      rowCash.style.display = 'flex';
      elCash.textContent = formatRupiah(order.nominal_bayar);
    } else {
      rowCash.style.display = 'none';
    }
  }

  const rowChange = document.getElementById('rcp-row-change');
  const elChange = document.getElementById('rcp-pay-change');
  if (rowChange && elChange) {
    if (order.kembalian !== undefined && Number(order.kembalian) > 0) {
      rowChange.style.display = 'flex';
      elChange.textContent = formatRupiah(order.kembalian);
    } else {
      rowChange.style.display = 'none';
    }
  }

  if (rcpNotes) rcpNotes.textContent = order.catatan ? `Catatan: ${order.catatan}` : '';
  if (rcpPhone) rcpPhone.textContent = `WA: ${DEMO_CONFIG.PHONE_CONTACT}`;

  const directUrl = `${window.location.origin}${window.location.pathname}?resi=${encodeURIComponent(order.id_pesanan)}`;
  if (rcpUrl) rcpUrl.textContent = directUrl;
  if (rcpQr) rcpQr.src = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(directUrl)}`;

  const btnWa = document.getElementById('rcp-btn-wa');
  if (btnWa) {
    const cleanPhone = formatIndonesianPhone(order.no_whatsapp);
    const msg = encodeURIComponent(`*iLAUNDRY EXPRESS - NOTA PESANAN*\nHalo Kak ${order.nama_pelanggan},\nNo. Resi: ${order.id_pesanan}\nTotal: ${formatRupiah(order.total_biaya)}\nStatus: ${order.status_cucian}\nLacak: ${directUrl}`);
    btnWa.href = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${msg}`;
    btnWa.onclick = function() {
      showToast(`📲 [Simulasi Demo] Membuka WhatsApp untuk ${order.nama_pelanggan}...`, 'info');
    };
  }

  modal.style.display = 'block';
}

function closeReceiptModal() {
  const modal = document.getElementById('receipt-modal');
  if (modal) modal.style.display = 'none';
}

function printReceipt() {
  window.print();
}

// ============================================
// MODAL KELOLA LAYANAN & MIGRASI
// ============================================

function openServicesModal() {
  const modal = document.getElementById('services-modal');
  if (modal) {
    modal.style.display = 'flex';
    renderServicesManagementTable();
  }
}

function closeServicesModal() {
  const modal = document.getElementById('services-modal');
  if (modal) modal.style.display = 'none';
}

function renderServicesManagementTable() {
  const tbody = document.getElementById('services-modal-tbody');
  if (!tbody) return;

  let html = '';
  state.services.forEach(s => {
    html += `
      <tr>
        <td><strong>${s.id}</strong></td>
        <td>${s.nama_layanan}</td>
        <td><span class="badge badge-primary">${s.jenis}</span></td>
        <td>${formatRupiah(s.harga)} / ${s.satuan}</td>
        <td>${s.estimasi_hari} Hari</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="editServicePrice('${s.id}')">✏️ Edit Harga</button>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

function editServicePrice(id) {
  const s = state.services.find(item => item.id === id);
  if (!s) return;
  const newPrice = prompt(`Ubah tarif untuk "${s.nama_layanan}" (saat ini ${formatRupiah(s.harga)}):`, s.harga);
  if (newPrice && !isNaN(newPrice) && Number(newPrice) > 0) {
    s.harga = Number(newPrice);
    saveDemoServices();
    renderServicesManagementTable();
    renderCatalog();
    renderSimulationDropdown();
    renderOrderServiceDropdown();
    showToast(`✅ Tarif ${s.nama_layanan} berhasil diubah menjadi ${formatRupiah(s.harga)}!`, 'success');
  }
}

function handleSaveService(e) {
  e.preventDefault();
  const nama = (document.getElementById('srv-nama').value || '').trim();
  const jenis = document.getElementById('srv-jenis').value;
  const harga = Number(document.getElementById('srv-harga').value) || 0;
  const satuan = (document.getElementById('srv-satuan').value || 'Kg').trim();
  const estimasi = Number(document.getElementById('srv-estimasi').value) || 1;

  const newId = 'L' + ('0' + (state.services.length + 1)).slice(-2);
  const newService = {
    id: newId,
    nama_layanan: nama,
    jenis: jenis,
    harga: harga,
    satuan: satuan,
    estimasi_hari: estimasi,
    status_aktif: 'Aktif'
  };

  state.services.push(newService);
  saveDemoServices();
  renderServicesManagementTable();
  renderCatalog();
  renderSimulationDropdown();
  renderOrderServiceDropdown();
  resetServiceForm();
  showToast(`✅ Layanan "${nama}" berhasil ditambahkan ke katalog demo!`, 'success');
}

function resetServiceForm() {
  const form = document.getElementById('service-form');
  if (form) form.reset();
}

function openImportModal() {
  const modal = document.getElementById('import-modal');
  if (modal) modal.style.display = 'flex';
}

function closeImportModal() {
  const modal = document.getElementById('import-modal');
  if (modal) modal.style.display = 'none';
}

function switchImportMethod(type) {
  const btnSheet = document.getElementById('tab-btn-sheet');
  const btnCsv = document.getElementById('tab-btn-csv');
  const areaSheet = document.getElementById('import-sheet-area');
  const areaCsv = document.getElementById('import-csv-area');

  if (type === 'csv') {
    if (btnSheet) btnSheet.className = 'btn btn-secondary btn-sm';
    if (btnCsv) btnCsv.className = 'btn btn-primary btn-sm';
    if (areaSheet) areaSheet.style.display = 'none';
    if (areaCsv) areaCsv.style.display = 'block';
  } else {
    if (btnSheet) btnSheet.className = 'btn btn-primary btn-sm';
    if (btnCsv) btnCsv.className = 'btn btn-secondary btn-sm';
    if (areaSheet) areaSheet.style.display = 'block';
    if (areaCsv) areaCsv.style.display = 'none';
  }
}

function executeSpreadsheetMigration(isDryRun) {
  const repBox = document.getElementById('import-report-box');
  if (!repBox) return;

  repBox.style.display = 'block';
  if (isDryRun) {
    repBox.style.background = '#e0f2fe';
    repBox.style.color = '#0369a1';
    repBox.innerHTML = `<strong>🔍 Hasil Simulasi Pindai (Dry-Run):</strong><br>Ditemukan 25 data transaksi lama. 25 data siap dimigrasikan dengan total omset Rp 850.000 (0 data duplikat).`;
  } else {
    repBox.style.background = '#d1fae5';
    repBox.style.color = '#065f46';
    repBox.innerHTML = `<strong>✅ Simulasi Migrasi Berhasil!</strong><br>25 data transaksi berhasil diimpor ke sistem demo. (Database asli aman tanpa tersentuh).`;
  }
}

function handleCsvFileSelected(e) {
  const file = e.target.files[0];
  const info = document.getElementById('csv-preview-info');
  const btn = document.getElementById('btn-run-csv-import');
  if (file) {
    if (info) {
      info.style.display = 'block';
      info.textContent = `📄 File terpilih: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    }
    if (btn) btn.style.display = 'block';
  }
}

function executeCsvMigration() {
  const repBox = document.getElementById('import-report-box');
  if (repBox) {
    repBox.style.display = 'block';
    repBox.style.background = '#d1fae5';
    repBox.style.color = '#065f46';
    repBox.innerHTML = `<strong>✅ Simulasi Impor CSV Berhasil!</strong><br>Data dari berkas CSV berhasil diproses ke antrean demo.`;
  }
}

// ============================================
// MODUL PELUNASAN PEMBAYARAN (SAAT PENGAMBILAN)
// ============================================

function openSettlementModal(resi) {
  const order = state.orders.find(o => String(o.id_pesanan).trim() === String(resi).trim());
  if (!order) {
    showToast('Data pesanan tidak ditemukan.', 'error');
    return;
  }

  state.activeSettlementOrder = order;
  state.settlementPayMethod = 'CASH';

  document.getElementById('stl-resi').textContent = order.id_pesanan;
  document.getElementById('stl-nama').textContent = order.nama_pelanggan;
  document.getElementById('stl-layanan').textContent = `${order.layanan} (${order.jumlah})`;
  document.getElementById('stl-total').textContent = formatRupiah(order.total_biaya);

  selectStlMethod('CASH');
  const cashInput = document.getElementById('stl-cash-input');
  if (cashInput) cashInput.value = '';
  calculateStlChange();

  const modal = document.getElementById('settlement-modal');
  if (modal) modal.style.display = 'flex';
}

function closeSettlementModal() {
  const modal = document.getElementById('settlement-modal');
  if (modal) modal.style.display = 'none';
  state.activeSettlementOrder = null;
}

function selectStlMethod(method) {
  state.settlementPayMethod = method;
  ['cash', 'qris', 'transfer'].forEach(m => {
    const btn = document.getElementById(`stl-method-${m}`);
    const box = document.getElementById(`stl-${m}-box`);
    if (btn) {
      if (m === method.toLowerCase()) btn.classList.add('active');
      else btn.classList.remove('active');
    }
    if (box) {
      box.style.display = m === method.toLowerCase() ? 'block' : 'none';
    }
  });

  const order = state.activeSettlementOrder;
  if (!order) return;

  if (method === 'QRIS') {
    const qrisNominal = document.getElementById('stl-qris-nominal');
    if (qrisNominal) qrisNominal.textContent = formatRupiah(order.total_biaya);
    const qrisImg = document.getElementById('stl-qris-img');
    const qrisUrl = state.settings.qris_image_url || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('iLaundry Pro Pelunasan ' + order.id_pesanan + ' Rp ' + order.total_biaya)}`;
    if (qrisImg) qrisImg.src = qrisUrl;
  } else if (method === 'TRANSFER') {
    const bName = document.getElementById('stl-bank-name');
    const bAcc = document.getElementById('stl-bank-acc');
    const bHolder = document.getElementById('stl-bank-holder');
    if (bName) bName.textContent = `BANK ${state.settings.bank_name || 'BCA'}`;
    if (bAcc) bAcc.textContent = state.settings.bank_account_number || '1234567890';
    if (bHolder) bHolder.textContent = `a.n. ${state.settings.bank_account_holder || 'iLaundry Pro by RASH'}`;
  } else if (method === 'CASH') {
    calculateStlChange();
  }
}

function calculateStlChange() {
  const order = state.activeSettlementOrder;
  if (!order) return;

  const total = Number(order.total_biaya) || 0;
  const input = document.getElementById('stl-cash-input');
  const preview = document.getElementById('stl-change-preview');
  const badge = document.getElementById('stl-change-status');
  if (!input || !preview) return;

  const cash = Number(input.value) || 0;
  if (!input.value) {
    preview.textContent = 'Rp 0';
    if (badge) {
      badge.textContent = 'Masukkan Nominal';
      badge.className = 'badge badge-gray';
    }
    return;
  }

  const change = cash - total;
  if (change < 0) {
    preview.textContent = `- ${formatRupiah(Math.abs(change))}`;
    preview.style.color = '#dc2626';
    if (badge) {
      badge.textContent = 'Kurang ' + formatRupiah(Math.abs(change));
      badge.className = 'badge badge-danger';
    }
  } else if (change === 0) {
    preview.textContent = 'Rp 0';
    preview.style.color = '#15803d';
    if (badge) {
      badge.textContent = 'Uang Pas';
      badge.className = 'badge badge-success';
    }
  } else {
    preview.textContent = formatRupiah(change);
    preview.style.color = '#15803d';
    if (badge) {
      badge.textContent = 'Kembalian ' + formatRupiah(change);
      badge.className = 'badge badge-success';
    }
  }
}

function setStlQuickCash(type) {
  const order = state.activeSettlementOrder;
  if (!order) return;

  const total = Number(order.total_biaya) || 0;
  const input = document.getElementById('stl-cash-input');
  if (!input) return;

  if (type === 'exact') {
    input.value = total;
  } else if (typeof type === 'number') {
    if (type >= total) {
      input.value = type;
    } else {
      input.value = Math.ceil(total / type) * type;
    }
  }
  calculateStlChange();
}

function submitSettlementPayment() {
  const order = state.activeSettlementOrder;
  if (!order) return;

  const total = Number(order.total_biaya) || 0;
  const method = state.settlementPayMethod;
  let cashReceived = total;
  let change = 0;

  if (method === 'CASH') {
    const inputVal = Number(document.getElementById('stl-cash-input').value) || 0;
    if (inputVal < total) {
      showToast('Nominal tunai yang diterima kurang dari total tagihan!', 'error');
      return;
    }
    cashReceived = inputVal;
    change = cashReceived - total;
  }

  const newStatusCucian = document.getElementById('stl-status-cucian').value;

  order.status_bayar = 'Lunas';
  order.metode_bayar = method;
  order.nominal_bayar = cashReceived;
  order.kembalian = change;
  if (newStatusCucian) order.status_cucian = newStatusCucian;

  saveDemoOrders();
  closeSettlementModal();
  renderAdminOrdersTable(state.orders);
  renderDailySales();
  updateAdminStats(state.orders);

  showToast(`✅ [Demo] Pelunasan ${order.id_pesanan} berhasil via ${method}!`, 'success');
  openReceiptModal(order);
}

// ============================================
// MODUL PENGATURAN SUPER ADMIN (OWNER SELF-SERVICE)
// ============================================

function openSuperAdminModal() {
  if (!isSuperAdmin()) {
    showToast('Akses terbatas hanya untuk Super Admin (Owner).', 'error');
    return;
  }

  const s = state.settings || {};
  document.getElementById('sa-cs-phone').value = s.cs_phone || '08982485685';
  document.getElementById('sa-store-name').value = s.store_name || 'iLaundry Pro by RASH';

  const fonnteToggle = document.getElementById('sa-fonnte-toggle');
  const fonnteLabel = document.getElementById('sa-fonnte-toggle-label');
  const isFonnteOn = s.fonnte_active !== false && s.fonnte_active !== 'false';
  if (fonnteToggle) fonnteToggle.checked = isFonnteOn;
  if (fonnteLabel) fonnteLabel.textContent = isFonnteOn ? 'Aktif' : 'Nonaktif';

  if (fonnteToggle) {
    fonnteToggle.onchange = (e) => {
      if (fonnteLabel) fonnteLabel.textContent = e.target.checked ? 'Aktif' : 'Nonaktif';
    };
  }

  document.getElementById('sa-fonnte-token').value = s.fonnte_token || 'FbknoZ6kJ16R7BZGgJap';
  document.getElementById('sa-qris-merchant').value = s.qris_merchant_name || 'iLaundry Pro by RASH';
  document.getElementById('sa-qris-url').value = s.qris_image_url || '';
  previewSaQris(s.qris_image_url || '');

  document.getElementById('sa-bank-name').value = s.bank_name || 'BCA';
  document.getElementById('sa-bank-number').value = s.bank_account_number || '1234567890';
  document.getElementById('sa-bank-holder').value = s.bank_account_holder || 'iLaundry Pro by RASH';
  document.getElementById('sa-admin-pass').value = '';

  renderSuperAdminPricingTable();
  switchSuperAdminTab('general');

  const modal = document.getElementById('super-admin-modal');
  if (modal) modal.style.display = 'flex';
}

function closeSuperAdminModal() {
  const modal = document.getElementById('super-admin-modal');
  if (modal) modal.style.display = 'none';
}

function switchSuperAdminTab(tabName) {
  ['general', 'pricing', 'wa', 'qris', 'security'].forEach(t => {
    const btn = document.getElementById(`sa-tab-btn-${t}`);
    const sec = document.getElementById(`sa-tab-${t}`);
    if (btn) {
      if (t === tabName) btn.classList.add('active');
      else btn.classList.remove('active');
    }
    if (sec) {
      sec.style.display = t === tabName ? 'block' : 'none';
    }
  });
}

function handleQrisFileUpload(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('Harap pilih berkas gambar (PNG, JPG, JPEG)!', 'error');
    return;
  }

  showToast('Memuat & mengoptimasi gambar QRIS...', 'info');

  const reader = new FileReader();
  reader.onload = function(event) {
    const rawDataUrl = event.target.result;
    
    // Optimasi ukuran gambar dengan Canvas agar hemat memori (maks lebar/tinggi 550px)
    const img = new Image();
    img.onload = function() {
      const maxDim = 550;
      let w = img.width;
      let h = img.height;

      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);

      const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.86);
      const urlInput = document.getElementById('sa-qris-url');
      if (urlInput) urlInput.value = optimizedDataUrl;

      previewSaQris(optimizedDataUrl);
      showToast('✅ Berhasil memilih gambar QRIS lokal!', 'success');
    };
    img.src = rawDataUrl;
  };
  reader.readAsDataURL(file);
}

function previewSaQris(url) {
  const box = document.getElementById('sa-qris-preview-box');
  const img = document.getElementById('sa-qris-preview-img');
  if (!box || !img) return;

  if (url && url.trim().length > 5) {
    img.src = url.trim();
    box.style.display = 'block';
  } else {
    box.style.display = 'none';
  }
}

function renderSuperAdminPricingTable() {
  const tbody = document.getElementById('sa-pricing-table-tbody');
  if (!tbody) return;

  if (state.services.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Belum ada data layanan.</td></tr>';
    return;
  }

  tbody.innerHTML = state.services.map(srv => `
    <tr>
      <td><strong>${srv.nama_layanan}</strong></td>
      <td><span class="badge ${srv.jenis === 'Kiloan' ? 'badge-primary' : 'badge-warning'}">${srv.jenis}</span></td>
      <td><strong>${formatRupiah(srv.harga)}</strong></td>
      <td>/${srv.satuan}</td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="promptQuickEditPrice('${srv.id || ''}', '${srv.nama_layanan.replace(/'/g, "\\'")}', ${srv.harga})">
          ✏️ Ubah Harga
        </button>
      </td>
    </tr>
  `).join('');
}

function promptQuickEditPrice(id, name, currentPrice) {
  const newPrice = prompt(`Ubah harga untuk "${name}":\n(Masukkan tarif baru angka saja)`, currentPrice);
  if (newPrice === null) return;

  const num = Number(newPrice.replace(/[^0-9]/g, ''));
  if (isNaN(num) || num <= 0) {
    showToast('Harga harus berupa angka valid di atas 0.', 'error');
    return;
  }

  const srvObj = state.services.find(s => s.id === id || s.nama_layanan === name);
  if (srvObj) {
    srvObj.harga = num;
    saveDemoServices();
    renderCatalog();
    renderSimulationDropdown();
    renderOrderServiceDropdown();
    renderSuperAdminPricingTable();
    showToast(`✅ Tarif "${name}" diperbarui menjadi ${formatRupiah(num)}!`, 'success');
  }
}

function saveSuperAdminSettings() {
  const csPhone = document.getElementById('sa-cs-phone').value.trim();
  const storeName = document.getElementById('sa-store-name').value.trim();
  const fonnteActive = document.getElementById('sa-fonnte-toggle').checked;
  const fonnteToken = document.getElementById('sa-fonnte-token').value.trim();
  const qrisMerchant = document.getElementById('sa-qris-merchant').value.trim();
  const qrisUrl = document.getElementById('sa-qris-url').value.trim();
  const bankName = document.getElementById('sa-bank-name').value.trim();
  const bankNumber = document.getElementById('sa-bank-number').value.trim();
  const bankHolder = document.getElementById('sa-bank-holder').value.trim();
  const newPass = document.getElementById('sa-admin-pass').value.trim();

  const updates = {
    cs_phone: csPhone,
    store_name: storeName,
    fonnte_active: fonnteActive,
    fonnte_token: fonnteToken,
    qris_merchant_name: qrisMerchant,
    qris_image_url: qrisUrl,
    bank_name: bankName,
    bank_account_number: bankNumber,
    bank_account_holder: bankHolder
  };

  if (newPass) {
    updates.super_admin_pass = newPass;
  }

  state.settings = { ...state.settings, ...updates };
  localStorage.setItem('ilaundry_demo_settings', JSON.stringify(state.settings));
  applyStoreSettings(state.settings);

  showToast('✅ [Demo] Semua pengaturan toko & harga berhasil disimpan ke database!', 'success');
  closeSuperAdminModal();
}

function applyStoreSettings(s) {
  if (!s) return;
  if (s.cs_phone) {
    DEMO_CONFIG.PHONE_CONTACT = s.cs_phone;
    document.querySelectorAll('.cs-phone-display').forEach(el => el.textContent = s.cs_phone);
    const rcpPhone = document.getElementById('rcp-cs-phone');
    if (rcpPhone) rcpPhone.textContent = `WA: ${s.cs_phone}`;
  }

  refreshQrisDisplay();
  refreshBankDisplay();
}

function refreshQrisDisplay() {
  const s = state.settings || {};
  const merchantEl = document.getElementById('order-qris-merchant');
  if (merchantEl) merchantEl.textContent = s.qris_merchant_name || 'iLaundry Pro by RASH';

  const imgEl = document.getElementById('order-qris-img');
  if (imgEl) {
    const qrisUrl = s.qris_image_url || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('iLaundry Pro - ' + (s.qris_merchant_name || 'RASH'))}`;
    imgEl.src = qrisUrl;
  }
}

function refreshBankDisplay() {
  const s = state.settings || {};
  const nameEl = document.getElementById('order-bank-name');
  const accEl = document.getElementById('order-bank-acc');
  const holderEl = document.getElementById('order-bank-holder');

  if (nameEl) nameEl.textContent = `BANK ${s.bank_name || 'BCA'}`;
  if (accEl) accEl.textContent = s.bank_account_number || '1234567890';
  if (holderEl) holderEl.textContent = `a.n. ${s.bank_account_holder || 'iLaundry Pro by RASH'}`;
}

function copyBankAcc() {
  const s = state.settings || {};
  const acc = s.bank_account_number || '1234567890';
  navigator.clipboard.writeText(acc).then(() => {
    showToast(`Nomor rekening ${acc} berhasil disalin!`, 'success');
  }).catch(() => {
    showToast(`Nomor rekening: ${acc}`, 'info');
  });
}

function loadAllOrders() {
  initDemoStorage(false);
  renderAdminOrdersTable(state.orders);
  updateAdminStats(state.orders);
  showToast('🔄 Data transaksi demo diperbarui!', 'info');
}

// ============================================
// INITIALIZATION ON LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initDemoStorage(false);
  checkAdminAuth();
  renderCatalog();
  renderSimulationDropdown();
  renderOrderServiceDropdown();
  updateAdminStats(state.orders);

  const urlParams = new URLSearchParams(window.location.search);
  const resiParam = urlParams.get('resi');
  if (resiParam) {
    const input = document.getElementById('track-input');
    if (input) input.value = resiParam;
    handleTrackSearch();
  }
});
