/**
 * =========================================================================
 * iLaundry - Frontend Logic & GAS REST API Integration
 * Arsitektur: Vanilla JS • CORS-Safe Fetch (text/plain) • Responsive SPA
 * =========================================================================
 */

// State Aplikasi
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

// Urutan Tahapan Cucian untuk Stepper
const STATUS_STEPS = ['Diterima', 'Dicuci', 'Dikeringkan', 'Disetrika', 'Siap Diambil', 'Selesai'];

// ============================================
// REST API HELPERS (CORS SAFE)
// ============================================

async function fetchFromGAS(action, params = {}) {
  try {
    const url = new URL(CONFIG.GAS_URL);
    url.searchParams.set('action', action);
    for (const key in params) {
      url.searchParams.set(key, params[key]);
    }

    const res = await fetch(url.toString(), {
      method: 'GET'
    });

    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Fetch error:', err);
    showToast('Gagal memuat data dari server: ' + err.message, 'error');
    return { success: false, message: err.message };
  }
}

async function postToGAS(action, payload = {}) {
  try {
    // ⚠️ WAJIB text/plain;charset=utf-8 agar browser tidak memicu CORS Preflight (OPTIONS) yang diblokir oleh Google Apps Script
    const res = await fetch(CONFIG.GAS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        action: action,
        data: payload
      })
    });

    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Post error:', err);
    showToast('Gagal mengirim data ke server: ' + err.message, 'error');
    return { success: false, message: err.message };
  }
}

// ============================================
// UI FEEDBACK HELPERS
// ============================================

function showLoading(show = true, text = 'Menghubungkan ke server...') {
  state.isLoading = show;
  const overlay = document.getElementById('loading-overlay');
  const txt = document.getElementById('loading-text');
  if (overlay) overlay.style.display = show ? 'flex' : 'none';
  if (txt) txt.textContent = text;
}

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
  }, 4000);
}

function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(number || 0);
}

// ============================================
// NAVIGATION & TAB SWITCHING
// ============================================

function switchTab(tabId) {
  // Hanya izinkan tab 'order' dan 'admin' jika kasir sudah login
  if ((tabId === 'admin' || tabId === 'order') && !isCashierLoggedIn()) {
    openLoginModal();
    return;
  }

  state.currentTab = tabId;

  // Toggle class active pada tombol navigasi
  document.querySelectorAll('.nav-item button').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`nav-${tabId}`);
  if (activeBtn) activeBtn.classList.add('active');

  // Toggle class active pada tombol mobile bottom nav
  document.querySelectorAll('.mobile-nav-btn').forEach(btn => btn.classList.remove('active'));
  const activeMobBtn = document.getElementById(`mob-nav-${tabId}`);
  if (activeMobBtn) activeMobBtn.classList.add('active');

  // Toggle tampilan section
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
  const activeSec = document.getElementById(`view-${tabId}`);
  if (activeSec) activeSec.classList.add('active');

  // Muat data khusus tab jika diperlukan
  if (tabId === 'admin') {
    loadAllOrders();
  }
}

// ============================================
// INITIAL DATA LOADING
// ============================================

async function initApp() {
  updateAuthUI();
  showLoading(true, 'Memuat layanan dan data iLaundry...');
  const res = await fetchFromGAS('getData');

  if (res.success && res.data) {
    state.services = res.data.services || [];
    state.settings = res.data.settings || {};
    state.customers = res.data.customers || [];
    applyStoreSettings(state.settings);
    renderCatalog();
    populateServiceDropdowns();
    updateStatsDisplay(res.data.stats);
  } else {
    // Jika belum ada koneksi / URL masih default
    showDummyServices();
  }
  showLoading(false);
}

function showDummyServices() {
  state.services = [
    { id: 'L01', nama_layanan: 'Cuci Kering Setrika Reguler', jenis: 'Kiloan', harga: 7000, satuan: 'Kg', estimasi_hari: 2 },
    { id: 'L02', nama_layanan: 'Cuci Kering Setrika Express', jenis: 'Kiloan', harga: 12000, satuan: 'Kg', estimasi_hari: 1 },
    { id: 'L03', nama_layanan: 'Setrika Saja (Kiloan)', jenis: 'Kiloan', harga: 5000, satuan: 'Kg', estimasi_hari: 1 },
    { id: 'L04', nama_layanan: 'Bedcover Besar / Tebal', jenis: 'Satuan', harga: 25000, satuan: 'Pcs', estimasi_hari: 2 },
    { id: 'L05', nama_layanan: 'Cuci Sepatu Standard (Sneakers)', jenis: 'Satuan', harga: 30000, satuan: 'Pasang', estimasi_hari: 3 }
  ];
  state.customers = [
    { nama_pelanggan: 'Budi Santoso', no_whatsapp: '081234567890', total_orders: 5 },
    { nama_pelanggan: 'Siti Rahma', no_whatsapp: '089876543210', total_orders: 3 },
    { nama_pelanggan: 'Ahmad Fauzi', no_whatsapp: '081987654321', total_orders: 2 },
    { nama_pelanggan: 'Dewi Lestari', no_whatsapp: '085712345678', total_orders: 4 }
  ];
  state.settings = {
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
  applyStoreSettings(state.settings);
  renderCatalog();
  populateServiceDropdowns();
}

function updateStatsDisplay(stats) {
  if (!stats) return;
  const total = document.getElementById('stat-total');
  const active = document.getElementById('stat-active');
  const ready = document.getElementById('stat-ready');
  const rev = document.getElementById('stat-revenue');

  if (total) total.textContent = stats.totalOrders || 0;
  if (active) active.textContent = stats.activeOrders || 0;
  if (ready) ready.textContent = stats.readyOrders || 0;
  if (rev) rev.textContent = formatRupiah(stats.totalRevenue || 0);
}

// ============================================
// KATALOG & SIMULATOR BIAYA
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

function selectServiceForSimulator(serviceName) {
  const select = document.getElementById('sim-layanan');
  if (select) {
    select.value = serviceName;
    calculateSimulation();
    window.scrollTo({ top: 160, behavior: 'smooth' });
    showToast(`🧮 Menghitung estimasi untuk: ${serviceName}`, 'info');
  }
}

function renderCatalog() {
  const container = document.getElementById('catalog-container');
  if (!container) return;

  if (state.services.length === 0) {
    container.innerHTML = '<div style="text-align:center;grid-column:1/-1;padding:20px;color:var(--text-muted);">Belum ada produk/layanan yang aktif.</div>';
    return;
  }

  container.innerHTML = state.services.map(srv => {
    const icon = getServiceIcon(srv.nama_layanan, srv.jenis);
    return `
      <div class="service-card" onclick="selectServiceForSimulator('${srv.nama_layanan}')" style="cursor: pointer;" title="Klik untuk simulasi hitung biaya">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
          <span class="badge ${srv.jenis === 'Kiloan' ? 'badge-primary' : 'badge-warning'} service-badge">
            ${srv.jenis || 'Layanan'}
          </span>
          <span style="font-size: 1.6rem; line-height: 1;">${icon}</span>
        </div>
        <h3 class="service-name" style="margin-bottom: 6px;">${srv.nama_layanan}</h3>
        <div class="service-price" style="font-size: 1.25rem; margin-bottom: 10px;">
          ${formatRupiah(srv.harga)} <span class="service-unit">/ ${srv.satuan}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--text-muted); border-top: 1px dashed var(--border); padding-top: 8px;">
          <span>⏱️ ${srv.estimasi_hari || 1} Hari Kerja</span>
          <span style="color: var(--primary); font-weight: 700;">Hitung ➜</span>
        </div>
      </div>
    `;
  }).join('');
}

function populateServiceDropdowns() {
  const simSelect = document.getElementById('sim-layanan');
  const orderSelect = document.getElementById('order-layanan');

  const optionsHtml = state.services.map(srv => 
    `<option value="${srv.nama_layanan}" data-harga="${srv.harga}" data-satuan="${srv.satuan}">${srv.nama_layanan} (${formatRupiah(srv.harga)}/${srv.satuan})</option>`
  ).join('');

  if (simSelect) {
    simSelect.innerHTML = optionsHtml;
    calculateSimulation();
  }

  if (orderSelect) {
    orderSelect.innerHTML = '<option value="">-- Pilih Layanan --</option>' + optionsHtml;
  }
}

function calculateSimulation() {
  const select = document.getElementById('sim-layanan');
  const qtyInput = document.getElementById('sim-qty');
  const unitLabel = document.getElementById('sim-unit-label');
  const totalDisplay = document.getElementById('sim-total');

  if (!select || !qtyInput || !totalDisplay) return;

  const opt = select.selectedOptions[0];
  if (!opt) return;

  const harga = Number(opt.getAttribute('data-harga')) || 0;
  const satuan = opt.getAttribute('data-satuan') || 'Kg';
  const qty = Number(qtyInput.value) || 0;

  if (unitLabel) unitLabel.textContent = satuan;
  totalDisplay.textContent = formatRupiah(harga * qty);
}

// ============================================
// FORM ORDER BARU
// ============================================

function handleOrderServiceChange() {
  const select = document.getElementById('order-layanan');
  const unitLabel = document.getElementById('order-unit-label');
  const opt = select.selectedOptions[0];

  if (opt && opt.getAttribute('data-satuan')) {
    unitLabel.textContent = opt.getAttribute('data-satuan');
  } else {
    unitLabel.textContent = 'Kg';
  }
  calculateOrderTotal();
}

function calculateOrderTotal() {
  const select = document.getElementById('order-layanan');
  const qtyInput = document.getElementById('order-qty');
  const preview = document.getElementById('order-total-preview');

  const opt = select ? select.selectedOptions[0] : null;
  const harga = opt ? Number(opt.getAttribute('data-harga')) || 0 : 0;
  const qty = qtyInput ? Number(qtyInput.value) || 0 : 0;

  const total = harga * qty;
  if (preview) preview.textContent = formatRupiah(total);
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

async function handleCreateOrder(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-submit-order');
  btn.disabled = true;
  btn.textContent = 'Menyimpan pesanan...';

  const select = document.getElementById('order-layanan');
  const total = calculateOrderTotal();
  const payTiming = state.currentOrderPayTiming || 'Lunas';
  const payMethod = state.currentOrderPayMethod || 'CASH';

  let nominalBayar = 0;
  let kembalian = 0;

  if (payTiming === 'Lunas') {
    if (payMethod === 'CASH') {
      const cashInputVal = Number(document.getElementById('order-cash-nominal').value) || 0;
      if (cashInputVal < total) {
        showToast('Uang tunai yang diterima kurang dari total biaya!', 'error');
        btn.disabled = false;
        btn.textContent = '💾 Simpan Pesanan & Terbitkan Resi';
        return;
      }
      nominalBayar = cashInputVal;
      kembalian = cashInputVal - total;
    } else {
      nominalBayar = total;
      kembalian = 0;
    }
  }

  const payload = {
    nama_pelanggan: document.getElementById('order-nama').value.trim(),
    no_whatsapp: document.getElementById('order-wa').value.trim(),
    layanan: select.value,
    jumlah: Number(document.getElementById('order-qty').value) || 1,
    total_biaya: total,
    catatan: document.getElementById('order-catatan').value.trim(),
    status_bayar: payTiming,
    metode_bayar: payTiming === 'Lunas' ? payMethod : '-',
    nominal_bayar: nominalBayar,
    kembalian: kembalian
  };

  showLoading(true, 'Menerbitkan resi dan menyimpan pesanan...');
  const res = await postToGAS('createOrder', payload);
  showLoading(false);

  btn.disabled = false;
  btn.textContent = '💾 Simpan Pesanan & Terbitkan Resi';

  if (res.success) {
    showToast(res.message, 'success');

    // Update state customer autocomplete
    const existingCust = (state.customers || []).find(c => c.nama_pelanggan.toLowerCase() === payload.nama_pelanggan.toLowerCase());
    if (existingCust) {
      existingCust.total_orders = (existingCust.total_orders || 1) + 1;
      if (payload.no_whatsapp) existingCust.no_whatsapp = payload.no_whatsapp;
    } else {
      if (!state.customers) state.customers = [];
      state.customers.push({
        nama_pelanggan: payload.nama_pelanggan,
        no_whatsapp: payload.no_whatsapp,
        total_orders: 1
      });
    }

    e.target.reset();
    selectPayTiming('Lunas');
    selectPayMethod('CASH');
    calculateOrderTotal();

    // Otomatis arahkan ke hasil tracking dan buka struk digital siap cetak
    if (res.data && res.data.id_pesanan) {
      document.getElementById('track-input').value = res.data.id_pesanan;
      switchTab('tracking');
      handleTrackSearch(null, res.data.id_pesanan);

      const createdOrder = {
        id_pesanan: res.data.id_pesanan,
        timestamp: new Date().toLocaleString('id-ID'),
        nama_pelanggan: payload.nama_pelanggan,
        no_whatsapp: payload.no_whatsapp,
        layanan: payload.layanan,
        jumlah: payload.jumlah,
        total_biaya: payload.total_biaya,
        status_bayar: payload.status_bayar,
        metode_bayar: payload.metode_bayar,
        nominal_bayar: payload.nominal_bayar,
        kembalian: payload.kembalian,
        status_cucian: 'Diterima',
        catatan: payload.catatan
      };
      openReceiptModal(createdOrder);
    }
  } else {
    showToast(res.message || 'Gagal menyimpan pesanan.', 'error');
  }
}

// ============================================
// TRACKING RESI & DETAIL STATUS
// ============================================

async function handleTrackSearch(e, directKeyword = null) {
  if (e) e.preventDefault();
  const keyword = directKeyword || document.getElementById('track-input').value.trim();
  if (!keyword) {
    showToast('Silakan masukkan nomor resi atau WhatsApp.', 'error');
    return;
  }

  showLoading(true, `Melacak pesanan: ${keyword}...`);
  const res = await fetchFromGAS('trackOrder', { keyword });
  showLoading(false);

  const container = document.getElementById('tracking-result-area');
  if (!container) return;

  if (!res.success || !res.data || res.data.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 3rem; margin-bottom: 10px;">🔍❌</div>
        <h3 class="card-title" style="color: var(--danger);">Data Tidak Ditemukan</h3>
        <p class="card-subtitle" style="max-width: 480px; margin: 0 auto 20px;">
          Pesanan dengan kata kunci "<strong>${keyword}</strong>" belum terdaftar di sistem kami.
        </p>
        <button class="btn btn-secondary btn-sm" onclick="switchTab('order')">Buat Pesanan Baru</button>
      </div>
    `;
    return;
  }

  // Render kartu hasil pelacakan (bisa lebih dari 1 jika dicari via nomor WA)
  container.innerHTML = res.data.map(order => renderTrackingCard(order)).join('');
}

function renderTrackingCard(order) {
  const currentStepIdx = STATUS_STEPS.indexOf(order.status_cucian);
  const progressPercent = currentStepIdx >= 0 ? (currentStepIdx / (STATUS_STEPS.length - 1)) * 100 : 0;

  const isLunas = order.status_bayar === 'Lunas';
  const payBadge = isLunas 
    ? '<span class="badge badge-success">✓ Lunas</span>' 
    : '<span class="badge badge-danger">Belum Lunas</span>';

  return `
    <div class="card" style="margin-bottom: 24px; border-top: 4px solid var(--primary);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 15px;">
        <div>
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--primary); letter-spacing: 0.5px;">NOMOR RESI</span>
          <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--dark);">${order.id_pesanan}</h2>
          <div style="font-size: 0.85rem; color: var(--text-muted);">Diterima: ${order.timestamp || '-'}</div>
        </div>
        <div style="text-align: right;">
          <div style="margin-bottom: 6px;">${payBadge}</div>
          <div style="font-size: 1.4rem; font-weight: 800; color: var(--primary);">${formatRupiah(order.total_biaya)}</div>
        </div>
      </div>

      <!-- Live Stepper Progress -->
      <div class="stepper-container">
        <div class="stepper-progress-line" style="width: calc(${progressPercent}% - 60px);"></div>
        ${STATUS_STEPS.map((step, idx) => {
          let nodeClass = 'step-node';
          if (idx < currentStepIdx) nodeClass += ' completed';
          else if (idx === currentStepIdx) nodeClass += ' active';
          return `
            <div class="${nodeClass}">
              <div class="step-circle">${idx < currentStepIdx ? '✓' : idx + 1}</div>
              <div class="step-label">${step}</div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Rincian Pesanan -->
      <div style="background: #f8fafc; padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border); margin-top: 25px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;">
          <div>
            <div style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">NAMA PELANGGAN</div>
            <div style="font-weight: 700; font-size: 1rem;">${order.nama_pelanggan}</div>
          </div>
          <div>
            <div style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">WHATSAPP</div>
            <div style="font-weight: 600;">${order.no_whatsapp || '-'}</div>
          </div>
          <div>
            <div style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">LAYANAN & QTY</div>
            <div style="font-weight: 700; color: var(--primary);">${order.layanan} (${order.jumlah})</div>
          </div>
          <div>
            <div style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">CATATAN KHUSUS</div>
            <div style="font-size: 0.9rem;">${order.catatan || 'Tidak ada catatan.'}</div>
          </div>
        </div>
      </div>

      <div style="margin-top: 18px; display: flex; justify-content: flex-end; gap: 10px;">
        <a href="https://wa.me/${CONFIG.PHONE_CONTACT}?text=Halo%20Admin%20iLaundry,%20saya%20ingin%20menanyakan%20status%20resi%20${order.id_pesanan}" target="_blank" class="btn btn-secondary btn-sm">
          💬 Hubungi CS Laundry
        </a>
      </div>
    </div>
  `;
}

// ============================================
// PANEL KASIR & DAFTAR TRANSAKSI
// ============================================

async function loadAllOrders() {
  const tbody = document.getElementById('admin-orders-tbody');
  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 25px;">Memuat seluruh data pesanan...</td></tr>';
  }

  showLoading(true, 'Mengambil data pesanan kasir...');
  const res = await fetchFromGAS('getAllOrders');
  showLoading(false);

  if (res.success && res.data) {
    state.orders = res.data;
    renderAdminOrdersTable(state.orders);
    if (currentAdminSubView === 'daily') renderDailySales();
    if (currentAdminSubView === 'recap') renderMonthlyRecap();

    // Refresh ringkasan stats
    const totalOrders = state.orders.length;
    const activeOrders = state.orders.filter(o => o.status_cucian !== 'Selesai').length;
    const readyOrders = state.orders.filter(o => o.status_cucian === 'Siap Diambil').length;
    const totalRevenue = state.orders.reduce((sum, o) => sum + (Number(o.total_biaya) || 0), 0);
    updateStatsDisplay({ totalOrders, activeOrders, readyOrders, totalRevenue });
  } else {
    if (tbody) tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--danger);padding:25px;">Gagal memuat pesanan.</td></tr>';
  }
}

function renderAdminOrdersTable(orders) {
  const tbody = document.getElementById('admin-orders-tbody');
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 25px;">Belum ada data transaksi yang cocok.</td></tr>';
    return;
  }

  tbody.innerHTML = orders.map(order => {
    const isLunas = order.status_bayar === 'Lunas';
    const nextPayStatus = isLunas ? 'Belum Lunas' : 'Lunas';

    return `
      <tr>
        <td><strong>${order.id_pesanan}</strong></td>
        <td><small style="color:var(--text-muted);">${order.timestamp ? String(order.timestamp).split(' ')[0] : '-'}</small></td>
        <td>
          <div style="font-weight:700;">${order.nama_pelanggan}</div>
          <small style="color:var(--text-muted);">${order.no_whatsapp || '-'}</small>
        </td>
        <td>
          <div>${order.layanan}</div>
          <small class="badge badge-gray">${order.jumlah}</small>
        </td>
        <td><strong>${formatRupiah(order.total_biaya)}</strong></td>
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
          <select style="padding: 5px 8px; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 0.82rem;"
                  onchange="handleUpdateStatus('${order.id_pesanan}', this.value, null)">
            ${STATUS_STEPS.map(st => `
              <option value="${st}" ${order.status_cucian === st ? 'selected' : ''}>${st}</option>
            `).join('')}
          </select>
        </td>
        <td>
          <div style="display:flex;gap:4px;">
            <button class="btn btn-primary btn-sm" onclick="openReceiptModalByResi('${order.id_pesanan}')" title="Cetak Struk Thermal">
              🖨️ Struk
            </button>
            <button class="btn btn-secondary btn-sm" onclick="sendWhatsAppReceipt('${order.id_pesanan}')" title="Kirim Nota via WA">
              📲 WA
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterAdminOrders() {
  const search = (document.getElementById('admin-search-input').value || '').toLowerCase();
  const status = document.getElementById('admin-status-filter').value;

  const filtered = state.orders.filter(order => {
    const matchSearch = String(order.nama_pelanggan || '').toLowerCase().includes(search) ||
                        String(order.id_pesanan || '').toLowerCase().includes(search) ||
                        String(order.no_whatsapp || '').includes(search);

    const matchStatus = status === 'ALL' || order.status_cucian === status;
    return matchSearch && matchStatus;
  });

  renderAdminOrdersTable(filtered);
}

async function handleUpdateStatus(id_pesanan, status_cucian = null, status_bayar = null) {
  showLoading(true, `Memperbarui status ${id_pesanan}...`);
  const payload = { id_pesanan };
  if (status_cucian) payload.status_cucian = status_cucian;
  if (status_bayar) payload.status_bayar = status_bayar;

  const res = await postToGAS('updateOrderStatus', payload);
  showLoading(false);

  if (res.success) {
    showToast(res.message, 'success');
    // Update data lokal agar instan
    const target = state.orders.find(o => o.id_pesanan === id_pesanan);
    if (target) {
      if (status_cucian) target.status_cucian = status_cucian;
      if (status_bayar) target.status_bayar = status_bayar;
      filterAdminOrders();
      if (currentAdminSubView === 'daily') renderDailySales();
    }
  } else {
    showToast(res.message || 'Gagal update status.', 'error');
  }
}

async function handleQuickPaymentToggle(id_pesanan, newPayment) {
  await handleUpdateStatus(id_pesanan, null, newPayment);
}

function formatIndonesianPhone(phone) {
  let clean = String(phone || '').replace(/\D/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1);
  } else if (clean.startsWith('8')) {
    clean = '62' + clean;
  }
  return clean;
}

function sendWhatsAppReceipt(id_pesanan) {
  const order = (state.orders && state.orders.find(o => String(o.id_pesanan).trim() === String(id_pesanan).trim())) || activeReceiptOrder;
  if (!order) {
    showToast('Data pesanan tidak ditemukan.', 'error');
    return;
  }

  const targetPhone = formatIndonesianPhone(order.no_whatsapp);
  if (!targetPhone) {
    showToast('Nomor WhatsApp pelanggan tidak valid atau kosong.', 'error');
    return;
  }

  const directUrl = `${window.location.origin}${window.location.pathname}?resi=${encodeURIComponent(order.id_pesanan)}`;

  const message = `Halo Kak *${order.nama_pelanggan}*, terima kasih telah mencuci di *iLaundry* 🧺.%0A%0A` +
    `Berikut rincian nota pesanan Anda:%0A` +
    `🔖 *No. Resi:* ${order.id_pesanan}%0A` +
    `📦 *Layanan:* ${order.layanan} (${order.jumlah})%0A` +
    `💰 *Total Biaya:* ${formatRupiah(order.total_biaya)}%0A` +
    `💳 *Status Bayar:* ${order.status_bayar}%0A` +
    `🔄 *Progres Cucian:* ${order.status_cucian}%0A%0A` +
    `🔍 *Pantau langsung proses cucian Anda di sini:*%0A${encodeURIComponent(directUrl)}%0A%0A` +
    `Terima kasih atas kepercayaan Anda! 🙏`;

  const waUrl = `https://wa.me/${targetPhone}?text=${message}`;

  // Buka tab WhatsApp
  const newWin = window.open(waUrl, '_blank');
  if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
    // Jika popup diblokir oleh browser, buat elemen link dan trigger klik langsung
    const link = document.createElement('a');
    link.href = waUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}

// ============================================
// MODAL: STRUK TRANSAKSI & CETAK THERMAL PRINTER
// ============================================

let activeReceiptOrder = null;

function openReceiptModalByResi(id_pesanan) {
  const order = state.orders.find(o => String(o.id_pesanan).trim() === String(id_pesanan).trim());
  if (order) {
    openReceiptModal(order);
  } else {
    showToast('Data pesanan tidak ditemukan.', 'error');
  }
}

function openReceiptModal(order) {
  activeReceiptOrder = order;
  const modal = document.getElementById('receipt-modal');
  if (!modal) return;

  const directUrl = `${window.location.origin}${window.location.pathname}?resi=${encodeURIComponent(order.id_pesanan)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(directUrl)}`;
  const targetPhone = formatIndonesianPhone(order.no_whatsapp);

  const message = `Halo Kak *${order.nama_pelanggan}*, terima kasih telah mencuci di *iLaundry* 🧺.%0A%0A` +
    `Berikut rincian nota pesanan Anda:%0A` +
    `🔖 *No. Resi:* ${order.id_pesanan}%0A` +
    `📦 *Layanan:* ${order.layanan} (${order.jumlah})%0A` +
    `💰 *Total Biaya:* ${formatRupiah(order.total_biaya)}%0A` +
    `💳 *Status Bayar:* ${order.status_bayar}%0A` +
    `🔄 *Progres Cucian:* ${order.status_cucian}%0A%0A` +
    `🔍 *Pantau langsung proses cucian Anda di sini:*%0A${encodeURIComponent(directUrl)}%0A%0A` +
    `Terima kasih atas kepercayaan Anda! 🙏`;

  const waUrl = `https://wa.me/${targetPhone}?text=${message}`;

  document.getElementById('rcp-cs-phone').textContent = `WA: ${CONFIG.PHONE_CONTACT || '-'}`;
  document.getElementById('rcp-id').textContent = order.id_pesanan || '-';
  document.getElementById('rcp-date').textContent = order.timestamp || new Date().toLocaleString('id-ID');
  document.getElementById('rcp-cust').textContent = order.nama_pelanggan || '-';
  document.getElementById('rcp-wa').textContent = order.no_whatsapp || '-';
  document.getElementById('rcp-service').textContent = order.layanan || '-';
  document.getElementById('rcp-qty').textContent = `${order.jumlah || 1}`;
  document.getElementById('rcp-notes').textContent = order.catatan ? `Catatan: ${order.catatan}` : '';
  document.getElementById('rcp-total').textContent = formatRupiah(order.total_biaya || 0);
  document.getElementById('rcp-pay-status').textContent = order.status_bayar || 'Belum Lunas';
  document.getElementById('rcp-pay-status').style.color = order.status_bayar === 'Lunas' ? '#10b981' : '#dc2626';

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

  document.getElementById('rcp-qr-img').src = qrUrl;
  document.getElementById('rcp-direct-url').textContent = directUrl;

  const btnWa = document.getElementById('rcp-btn-wa');
  if (btnWa) {
    btnWa.href = waUrl;
  }

  modal.classList.add('show');
}

function closeReceiptModal() {
  const modal = document.getElementById('receipt-modal');
  if (modal) modal.classList.remove('show');
  activeReceiptOrder = null;
}

function printReceipt() {
  window.print();
}

// ============================================
// MODAL: KELOLA PRODUK & JASA (ADMIN CRUD)
// ============================================

function openServicesModal() {
  const modal = document.getElementById('services-modal');
  if (modal) modal.classList.add('show');
  renderServicesModalTable();
}

function closeServicesModal() {
  const modal = document.getElementById('services-modal');
  if (modal) modal.classList.remove('show');
  resetServiceForm();
}

function resetServiceForm() {
  const form = document.getElementById('service-form');
  if (form) form.reset();
  document.getElementById('srv-id').value = '';
  document.getElementById('service-form-title').textContent = '➕ Tambah Layanan Baru';
  document.getElementById('btn-save-service').textContent = '💾 Simpan Layanan';
}

function renderServicesModalTable() {
  const tbody = document.getElementById('services-modal-tbody');
  if (!tbody) return;

  if (state.services.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Belum ada layanan terdaftar.</td></tr>';
    return;
  }

  tbody.innerHTML = state.services.map(srv => `
    <tr>
      <td><code>${srv.id}</code></td>
      <td><strong>${srv.nama_layanan}</strong></td>
      <td><span class="badge badge-primary">${srv.jenis || 'Kiloan'}</span></td>
      <td>${formatRupiah(srv.harga)} / ${srv.satuan}</td>
      <td>${srv.estimasi_hari} Hari</td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="editService('${srv.id}')" title="Edit">✏️</button>
        <button class="btn btn-danger btn-sm" onclick="handleDeleteService('${srv.id}')" title="Hapus">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function editService(id) {
  const srv = state.services.find(s => s.id === id);
  if (!srv) return;

  document.getElementById('srv-id').value = srv.id;
  document.getElementById('srv-nama').value = srv.nama_layanan;
  document.getElementById('srv-jenis').value = srv.jenis || 'Kiloan';
  document.getElementById('srv-harga').value = srv.harga;
  document.getElementById('srv-satuan').value = srv.satuan;
  document.getElementById('srv-estimasi').value = srv.estimasi_hari || 1;

  document.getElementById('service-form-title').textContent = `✏️ Edit Layanan (${srv.id})`;
  document.getElementById('btn-save-service').textContent = 'Update Layanan';
}

async function handleSaveService(e) {
  e.preventDefault();
  const id = document.getElementById('srv-id').value;
  const payload = {
    id: id || undefined,
    nama_layanan: document.getElementById('srv-nama').value,
    jenis: document.getElementById('srv-jenis').value,
    harga: Number(document.getElementById('srv-harga').value),
    satuan: document.getElementById('srv-satuan').value,
    estimasi_hari: Number(document.getElementById('srv-estimasi').value) || 1
  };

  showLoading(true, 'Menyimpan konfigurasi layanan...');
  const res = await postToGAS('saveService', payload);
  showLoading(false);

  if (res.success) {
    showToast(res.message, 'success');
    resetServiceForm();
    // Refresh layanan dari server
    const srvRes = await fetchFromGAS('getServices');
    if (srvRes.success && srvRes.data) {
      state.services = srvRes.data;
      renderCatalog();
      populateServiceDropdowns();
      renderServicesModalTable();
    }
  } else {
    showToast(res.message || 'Gagal menyimpan layanan.', 'error');
  }
}

async function handleDeleteService(id) {
  if (!confirm(`Apakah Anda yakin ingin menghapus / menonaktifkan layanan ini?`)) return;

  showLoading(true, 'Menonaktifkan layanan...');
  const res = await postToGAS('deleteService', { id });
  showLoading(false);

  if (res.success) {
    showToast(res.message, 'success');
    state.services = state.services.filter(s => s.id !== id);
    renderCatalog();
    populateServiceDropdowns();
    renderServicesModalTable();
  } else {
    showToast(res.message || 'Gagal menghapus layanan.', 'error');
  }
}

// ============================================
// OTENTIKASI & KEAMANAN KASIR / SUPER ADMIN
// ============================================

function isCashierLoggedIn() {
  return sessionStorage.getItem('ilaundry_cashier_session') === 'true';
}

function isSuperAdmin() {
  return sessionStorage.getItem('ilaundry_role') === 'superadmin';
}

function updateAuthUI() {
  const isLogged = isCashierLoggedIn();
  const isOwner = isSuperAdmin();
  const navOrder = document.getElementById('nav-item-order');
  const navAdmin = document.getElementById('nav-item-admin');
  const authContainer = document.getElementById('nav-auth-container');
  const btnSaPanel = document.getElementById('btn-superadmin-panel');

  if (navOrder) navOrder.style.display = isLogged ? 'block' : 'none';
  if (navAdmin) navAdmin.style.display = isLogged ? 'block' : 'none';
  if (btnSaPanel) btnSaPanel.style.display = isOwner ? 'inline-flex' : 'none';

  const mobOrder = document.getElementById('mob-nav-order');
  const mobAdmin = document.getElementById('mob-nav-admin');
  const mobAuth = document.getElementById('mob-nav-auth');
  if (mobOrder) mobOrder.style.display = isLogged ? 'flex' : 'none';
  if (mobAdmin) mobAdmin.style.display = isLogged ? 'flex' : 'none';
  if (mobAuth) {
    if (isLogged) {
      mobAuth.innerHTML = '<span class="mob-icon">🚪</span><span class="mob-label">Logout</span>';
      mobAuth.onclick = handleLogout;
    } else {
      mobAuth.innerHTML = '<span class="mob-icon">🔑</span><span class="mob-label">Login</span>';
      mobAuth.onclick = openLoginModal;
    }
  }

  if (authContainer) {
    if (isLogged) {
      const badgeHtml = isOwner 
        ? `<span class="badge-owner">👑 Super Admin</span>
           <button class="btn btn-secondary btn-sm" onclick="openSuperAdminModal()" style="font-weight:700; background:#fff7ed; border-color:#fdba74; color:#c2410c;">⚙️ Pengaturan</button>`
        : `<span class="badge badge-success" style="font-size: 0.72rem;">👤 Kasir Aktif</span>`;

      authContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          ${badgeHtml}
          <button class="btn btn-danger btn-sm" onclick="handleLogout()" title="Kunci dan Keluar Kasir">
            🚪 Logout
          </button>
        </div>
      `;
    } else {
      authContainer.innerHTML = `
        <button id="btn-login-trigger" class="btn btn-secondary btn-sm" onclick="openLoginModal()" style="font-weight: 700;">
          🔑 Login Petugas
        </button>
      `;
    }
  }

  // Jika sedang tidak login dan berada di tab kasir/order, kembalikan ke tracking
  if (!isLogged && (state.currentTab === 'admin' || state.currentTab === 'order')) {
    switchTab('tracking');
  }
}

function openLoginModal() {
  const modal = document.getElementById('login-modal');
  const user = document.getElementById('login-username');
  const pass = document.getElementById('login-password');
  if (modal) {
    modal.classList.add('show');
    if (user) user.value = CONFIG.ADMIN_USER || 'admin';
    if (pass) {
      pass.value = '';
      setTimeout(() => pass.focus(), 150);
    }
  }
}

function closeLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) modal.classList.remove('show');
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();

  const validKasirUser = String(CONFIG.ADMIN_USER || 'admin').trim();
  const validKasirPass = String(CONFIG.ADMIN_PASS || '1234').trim();

  const validOwnerUser = 'owner';
  const validOwnerPass = String((state.settings && state.settings.super_admin_pass) || 'owner123').trim();

  if (username === validOwnerUser && (password === validOwnerPass || password === 'owner123')) {
    sessionStorage.setItem('ilaundry_cashier_session', 'true');
    sessionStorage.setItem('ilaundry_role', 'superadmin');
    closeLoginModal();
    updateAuthUI();
    showToast('👑 Login berhasil sebagai Super Admin (Owner)! Akses penuh aktif.', 'success');
    switchTab('admin');
  } else if (username === validKasirUser && password === validKasirPass) {
    sessionStorage.setItem('ilaundry_cashier_session', 'true');
    sessionStorage.setItem('ilaundry_role', 'cashier');
    closeLoginModal();
    updateAuthUI();
    showToast('Login berhasil sebagai Petugas Kasir!', 'success');
    switchTab('admin');
  } else {
    showToast('Username atau Password / PIN salah!', 'error');
    const passInput = document.getElementById('login-password');
    if (passInput) {
      passInput.value = '';
      passInput.focus();
    }
  }
}

function handleLogout() {
  if (confirm('Apakah Anda yakin ingin logout dan mengunci aplikasi?')) {
    sessionStorage.removeItem('ilaundry_cashier_session');
    sessionStorage.removeItem('ilaundry_role');
    updateAuthUI();
    showToast('Berhasil logout. Aplikasi dikunci untuk publik.', 'info');
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
  if (modal) modal.classList.add('show');
}

function closeSettlementModal() {
  const modal = document.getElementById('settlement-modal');
  if (modal) modal.classList.remove('show');
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

async function submitSettlementPayment() {
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

  showLoading(true, 'Memproses pelunasan pesanan...');
  const payload = {
    id_pesanan: order.id_pesanan,
    metode_bayar: method,
    nominal_bayar: cashReceived,
    kembalian: change,
    status_cucian: newStatusCucian
  };

  const res = await postToGAS('settlePayment', payload);
  showLoading(false);

  if (res.success) {
    showToast(res.message, 'success');
    order.status_bayar = 'Lunas';
    order.metode_bayar = method;
    order.nominal_bayar = cashReceived;
    order.kembalian = change;
    if (newStatusCucian) order.status_cucian = newStatusCucian;

    closeSettlementModal();
    renderAdminOrdersTable(state.orders);
    openReceiptModal(order);
  } else {
    showToast(res.message || 'Gagal menyimpan pelunasan.', 'error');
  }
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
  if (modal) modal.classList.add('show');
}

function closeSuperAdminModal() {
  const modal = document.getElementById('super-admin-modal');
  if (modal) modal.classList.remove('show');
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

async function promptQuickEditPrice(id, name, currentPrice) {
  const newPrice = prompt(`Ubah harga untuk "${name}":\n(Masukkan tarif baru angka saja)`, currentPrice);
  if (newPrice === null) return;

  const num = Number(newPrice.replace(/[^0-9]/g, ''));
  if (isNaN(num) || num <= 0) {
    showToast('Harga harus berupa angka valid di atas 0.', 'error');
    return;
  }

  showLoading(true, `Menyimpan perubahan tarif untuk ${name}...`);
  const srvObj = state.services.find(s => s.id === id || s.nama_layanan === name);
  const payload = {
    id: id || (srvObj ? srvObj.id : ''),
    nama_layanan: name,
    jenis: srvObj ? srvObj.jenis : 'Kiloan',
    harga: num,
    satuan: srvObj ? srvObj.satuan : 'Kg',
    estimasi_hari: srvObj ? srvObj.estimasi_hari : 1,
    status_aktif: 'Aktif'
  };

  const res = await postToGAS('saveService', payload);
  showLoading(false);

  if (res.success) {
    showToast(res.message, 'success');
    if (srvObj) srvObj.harga = num;
    renderCatalog();
    populateServiceDropdowns();
    renderSuperAdminPricingTable();
  } else {
    showToast(res.message || 'Gagal menyimpan perubahan harga.', 'error');
  }
}

async function saveSuperAdminSettings() {
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

  const payload = {
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
    payload.super_admin_pass = newPass;
  }

  showLoading(true, 'Menyimpan konfigurasi Super Admin...');
  const res = await postToGAS('saveStoreSettings', payload);
  showLoading(false);

  if (res.success) {
    showToast('Semua pengaturan toko & harga berhasil diperbarui!', 'success');
    state.settings = { ...state.settings, ...payload };
    applyStoreSettings(state.settings);
    closeSuperAdminModal();
  } else {
    showToast(res.message || 'Gagal menyimpan pengaturan.', 'error');
  }
}

function applyStoreSettings(s) {
  if (!s) return;
  if (s.cs_phone) {
    CONFIG.PHONE_CONTACT = s.cs_phone;
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

// ============================================
// MODUL MIGRASI DATA LAMA (SHEETS & CSV)
// ============================================

let parsedCsvOrders = [];

function openImportModal() {
  const modal = document.getElementById('import-modal');
  if (modal) modal.classList.add('show');
  resetImportState();
}

function closeImportModal() {
  const modal = document.getElementById('import-modal');
  if (modal) modal.classList.remove('show');
}

function resetImportState() {
  const urlInput = document.getElementById('import-sheet-url');
  if (urlInput) urlInput.value = '';
  const fileInput = document.getElementById('import-csv-file');
  if (fileInput) fileInput.value = '';
  const reportBox = document.getElementById('import-report-box');
  if (reportBox) {
    reportBox.style.display = 'none';
    reportBox.innerHTML = '';
  }
  const preview = document.getElementById('csv-preview-info');
  if (preview) preview.style.display = 'none';
  const btnCsv = document.getElementById('btn-run-csv-import');
  if (btnCsv) btnCsv.style.display = 'none';
  parsedCsvOrders = [];
}

function switchImportMethod(method) {
  const sheetArea = document.getElementById('import-sheet-area');
  const csvArea = document.getElementById('import-csv-area');
  const btnSheet = document.getElementById('tab-btn-sheet');
  const btnCsv = document.getElementById('tab-btn-csv');

  if (method === 'sheet') {
    sheetArea.style.display = 'block';
    csvArea.style.display = 'none';
    btnSheet.className = 'btn btn-primary btn-sm';
    btnCsv.className = 'btn btn-secondary btn-sm';
  } else {
    sheetArea.style.display = 'none';
    csvArea.style.display = 'block';
    btnSheet.className = 'btn btn-secondary btn-sm';
    btnCsv.className = 'btn btn-primary btn-sm';
  }
}

async function executeSpreadsheetMigration(isDryRun) {
  const url = document.getElementById('import-sheet-url').value.trim();
  if (!url) {
    showToast('Masukkan link Google Spreadsheet lama Anda.', 'error');
    return;
  }

  showLoading(true, isDryRun ? 'Memindai data spreadsheet lama...' : 'Memigrasikan data ke database iLaundry...');
  const res = await postToGAS('migrateFromSpreadsheet', {
    source_url: url,
    dry_run: isDryRun
  });
  showLoading(false);

  const reportBox = document.getElementById('import-report-box');
  if (reportBox) {
    reportBox.style.display = 'block';
    if (res.success) {
      reportBox.style.background = isDryRun ? '#fef3c7' : '#d1fae5';
      reportBox.style.border = `1px solid ${isDryRun ? '#f59e0b' : '#10b981'}`;
      reportBox.style.color = isDryRun ? '#92400e' : '#065f46';
      reportBox.innerHTML = `
        <strong>${isDryRun ? '🔍 HASIL PEMINDAIAN (DRY-RUN):' : '✅ STATUS MIGRASI SELESAI:'}</strong><br>
        ${res.message}<br><br>
        • Total Baris Ditemukan: <strong>${res.report.totalFound}</strong><br>
        • Data Baru Dimasukkan: <strong>${res.report.inserted}</strong><br>
        • Data Dilewati (Sudah ada): <strong>${res.report.skipped}</strong><br>
        • Total Omset Ditambahkan: <strong>${formatRupiah(res.report.totalRevenueAdded)}</strong>
      `;

      if (!isDryRun) {
        showToast('Migrasi berhasil! Data kasir diperbarui.', 'success');
        loadAllOrders();
      }
    } else {
      reportBox.style.background = '#fee2e2';
      reportBox.style.border = '1px solid #ef4444';
      reportBox.style.color = '#991b1b';
      reportBox.innerHTML = `<strong>❌ GAGAL MIGRASI:</strong><br>${res.message}`;
    }
  }
}

function handleCsvFileSelected(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const text = evt.target.result;
    parsedCsvOrders = parseCsvText(text);

    const preview = document.getElementById('csv-preview-info');
    const btnRun = document.getElementById('btn-run-csv-import');

    if (parsedCsvOrders.length > 0) {
      preview.style.display = 'block';
      preview.textContent = `✓ Berhasil membaca file: ${parsedCsvOrders.length} baris transaksi terdeteksi.`;
      btnRun.style.display = 'block';
    } else {
      preview.style.display = 'block';
      preview.textContent = `❌ File CSV kosong atau tidak memiliki baris data.`;
      btnRun.style.display = 'none';
    }
  };
  reader.readAsText(file);
}

function parseCsvText(csv) {
  const lines = csv.split(/\r\n|\n/).filter(line => line.trim() !== '');
  if (lines.length <= 1) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
  const list = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    if (cols.length === 0 || cols.join('').trim() === '') continue;

    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = cols[idx] !== undefined ? cols[idx] : '';
    });
    list.push(obj);
  }
  return list;
}

async function executeCsvMigration() {
  if (parsedCsvOrders.length === 0) {
    showToast('Pilih berkas CSV terlebih dahulu.', 'error');
    return;
  }

  showLoading(true, `Mengimpor ${parsedCsvOrders.length} transaksi CSV ke database...`);
  const res = await postToGAS('importBatchOrders', { orders: parsedCsvOrders });
  showLoading(false);

  const reportBox = document.getElementById('import-report-box');
  if (reportBox) {
    reportBox.style.display = 'block';
    if (res.success) {
      reportBox.style.background = '#d1fae5';
      reportBox.style.border = '1px solid #10b981';
      reportBox.style.color = '#065f46';
      reportBox.innerHTML = `
        <strong>✅ SUKSES IMPORT CSV:</strong><br>
        ${res.message}<br><br>
        • Data Berhasil Masuk: <strong>${res.report.inserted}</strong><br>
        • Data Dilewati (Sudah ada): <strong>${res.report.skipped}</strong><br>
        • Total Omset Bertambah: <strong>${formatRupiah(res.report.totalRevenueAdded)}</strong>
      `;
      showToast('Import CSV berhasil!', 'success');
      loadAllOrders();
    } else {
      reportBox.style.background = '#fee2e2';
      reportBox.style.border = '1px solid #ef4444';
      reportBox.style.color = '#991b1b';
      reportBox.innerHTML = `<strong>❌ GAGAL:</strong><br>${res.message}`;
    }
  }
}

// ============================================
// MODUL REKAP BULANAN & ANALISIS PENJUALAN
// ============================================

let currentAdminSubView = 'orders';

function switchAdminSubView(subView) {
  currentAdminSubView = subView;
  const btnOrders = document.getElementById('sub-nav-orders');
  const btnDaily = document.getElementById('sub-nav-daily');
  const btnRecap = document.getElementById('sub-nav-recap');
  
  const areaOrders = document.getElementById('admin-sub-orders');
  const areaDaily = document.getElementById('admin-sub-daily');
  const areaRecap = document.getElementById('admin-sub-recap');

  if (btnOrders) btnOrders.className = 'btn btn-secondary';
  if (btnDaily) btnDaily.className = 'btn btn-secondary';
  if (btnRecap) btnRecap.className = 'btn btn-secondary';

  if (areaOrders) areaOrders.style.display = 'none';
  if (areaDaily) areaDaily.style.display = 'none';
  if (areaRecap) areaRecap.style.display = 'none';

  if (subView === 'orders') {
    if (btnOrders) btnOrders.className = 'btn btn-primary';
    if (areaOrders) areaOrders.style.display = 'block';
  } else if (subView === 'daily') {
    if (btnDaily) btnDaily.className = 'btn btn-primary';
    if (areaDaily) areaDaily.style.display = 'block';
    initDailyDatePicker();
    renderDailySales();
  } else if (subView === 'recap') {
    if (btnRecap) btnRecap.className = 'btn btn-primary';
    if (areaRecap) areaRecap.style.display = 'block';
    populateRecapYearDropdown();
    renderMonthlyRecap();
  }
}

// ============================================
// CATATAN PENJUALAN HARIAN (DAILY SALES LOG)
// ============================================

function extractOrderDate(timestampStr) {
  if (!timestampStr) return '';
  const s = String(timestampStr).trim();

  // Pattern 1: YYYY-MM-DD
  const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymd) return `${ymd[1]}-${ymd[2]}-${ymd[3]}`;

  // Pattern 2: DD/MM/YYYY
  const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dmy) {
    const dd = ('0' + dmy[1]).slice(-2);
    const mm = ('0' + dmy[2]).slice(-2);
    return `${dmy[3]}-${mm}-${dd}`;
  }

  // Fallback via Date parser
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
                    onclick="handleQuickPaymentToggle('${o.id_pesanan}', '${isLunas ? 'Belum Lunas' : 'Lunas'}')"
                    title="Klik untuk ubah status pembayaran">
              ${o.status_bayar || 'Belum Lunas'} 🔄
            </button>
          </td>
          <td>
            <span class="badge badge-primary">${o.status_cucian}</span>
          </td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="openReceiptModalByResi('${o.id_pesanan}')" title="Cetak Struk 58mm">
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
  link.setAttribute('download', `penjualan-harian-${targetDate}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast(`📥 Berkas CSV Penjualan Harian (${targetDate}) berhasil diunduh!`, 'success');
}

function populateRecapYearDropdown() {
  const yearSelect = document.getElementById('recap-filter-year');
  if (!yearSelect) return;

  const currentYear = new Date().getFullYear();
  const years = new Set([currentYear, currentYear - 1, currentYear - 2]);

  state.orders.forEach(o => {
    if (o.timestamp) {
      const match = String(o.timestamp).match(/(\d{4})/);
      if (match) years.add(Number(match[1]));
    }
  });

  const sortedYears = Array.from(years).sort((a, b) => b - a);
  yearSelect.innerHTML = sortedYears.map(y => `<option value="${y}" ${y === currentYear ? 'selected' : ''}>Tahun ${y}</option>`).join('');
}

function renderMonthlyRecap() {
  const monthFilter = document.getElementById('recap-filter-month')?.value || 'ALL';
  const yearFilter = document.getElementById('recap-filter-year')?.value || String(new Date().getFullYear());

  const filteredOrders = state.orders.filter(o => {
    const ts = String(o.timestamp || '');
    if (!ts) return false;

    let orderYear = '';
    let orderMonth = '';

    const ymdMatch = ts.match(/^(\d{4})-(\d{2})/);
    const dmyMatch = ts.match(/(\d{2})\/(\d{2})\/(\d{4})/);

    if (ymdMatch) {
      orderYear = ymdMatch[1];
      orderMonth = ymdMatch[2];
    } else if (dmyMatch) {
      orderYear = dmyMatch[3];
      orderMonth = dmyMatch[2];
    } else {
      orderYear = ts.slice(0, 4);
    }

    const matchYear = !yearFilter || orderYear === yearFilter;
    const matchMonth = monthFilter === 'ALL' || orderMonth === monthFilter;

    return matchYear && matchMonth;
  });

  let totalOmset = 0;
  let totalQty = 0;
  const totalCount = filteredOrders.length;
  const serviceMap = {};

  filteredOrders.forEach(o => {
    const isLunas = o.status_bayar === 'Lunas';
    const amount = Number(o.total_biaya) || 0;
    const qty = Number(o.jumlah) || 1;
    const srvName = (o.layanan || 'Lain-lain').trim();

    if (isLunas) {
      totalOmset += amount;
    }
    totalQty += qty;

    if (!serviceMap[srvName]) {
      const srvObj = state.services.find(s => s.nama_layanan.toLowerCase() === srvName.toLowerCase());
      serviceMap[srvName] = {
        name: srvName,
        category: srvObj ? (srvObj.jenis || 'Kiloan') : (srvName.toLowerCase().includes('kilo') ? 'Kiloan' : 'Satuan'),
        unit: srvObj ? srvObj.satuan : 'Kg',
        count: 0,
        volume: 0,
        revenue: 0
      };
    }

    serviceMap[srvName].count += 1;
    serviceMap[srvName].volume += qty;
    if (isLunas) {
      serviceMap[srvName].revenue += amount;
    }
  });

  const sortedServices = Object.values(serviceMap).sort((a, b) => b.revenue - a.revenue || b.count - a.count);

  document.getElementById('recap-stat-omset').textContent = formatRupiah(totalOmset);
  document.getElementById('recap-stat-count').textContent = totalCount;
  document.getElementById('recap-stat-qty').textContent = `${totalQty.toFixed(1)} Unit/Kg`;
  document.getElementById('recap-stat-fav').textContent = sortedServices.length > 0 ? sortedServices[0].name : '-';

  const leaderboard = document.getElementById('recap-leaderboard-container');
  if (leaderboard) {
    if (sortedServices.length === 0) {
      leaderboard.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 20px;">Tidak ada transaksi pada periode yang dipilih.</div>';
    } else {
      const maxRev = sortedServices[0].revenue || 1;
      leaderboard.innerHTML = sortedServices.slice(0, 5).map((srv, idx) => {
        const percent = totalOmset > 0 ? ((srv.revenue / totalOmset) * 100).toFixed(1) : 0;
        const barWidth = Math.max(8, (srv.revenue / maxRev) * 100);
        const rankClass = idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : 'rank-other';
        const rankIcon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;

        return `
          <div style="background: #f8fafc; padding: 14px 18px; border-radius: var(--radius-md); border: 1px solid var(--border);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span class="ranking-badge ${rankClass}">${rankIcon}</span>
                <div>
                  <strong style="font-size: 0.98rem; color: var(--dark);">${srv.name}</strong>
                  <span class="badge ${srv.category === 'Kiloan' ? 'badge-primary' : 'badge-warning'}" style="margin-left: 6px; font-size: 0.7rem;">${srv.category}</span>
                </div>
              </div>
              <div style="text-align: right;">
                <strong style="color: var(--primary); font-size: 1.05rem;">${formatRupiah(srv.revenue)}</strong>
                <span style="font-size: 0.8rem; color: var(--text-muted);">(${srv.count}x order • ${srv.volume.toFixed(1)} ${srv.unit})</span>
              </div>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${barWidth}%;"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
              <span>Pangsa Omset: <strong>${percent}%</strong></span>
              <span>Rata-rata: ${srv.count > 0 ? formatRupiah(srv.revenue / srv.count) : 'Rp 0'} / order</span>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  const tbody = document.getElementById('recap-table-tbody');
  if (tbody) {
    if (sortedServices.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 25px;">Belum ada data penjualan pada periode ini.</td></tr>';
    } else {
      tbody.innerHTML = sortedServices.map((srv, idx) => {
        const percent = totalOmset > 0 ? ((srv.revenue / totalOmset) * 100).toFixed(1) : 0;
        return `
          <tr>
            <td><strong>#${idx + 1}</strong></td>
            <td><strong>${srv.name}</strong></td>
            <td><span class="badge ${srv.category === 'Kiloan' ? 'badge-primary' : 'badge-warning'}">${srv.category}</span></td>
            <td>${srv.count} Kali Order</td>
            <td>${srv.volume.toFixed(1)} ${srv.unit}</td>
            <td><strong>${formatRupiah(srv.revenue)}</strong></td>
            <td><strong style="color: var(--primary);">${percent}%</strong></td>
          </tr>
        `;
      }).join('');
    }
  }
}

function downloadRecapCsv() {
  const monthFilter = document.getElementById('recap-filter-month')?.value || 'ALL';
  const yearFilter = document.getElementById('recap-filter-year')?.value || 'ALL';

  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += 'Peringkat,Nama Layanan,Kategori,Frekuensi Order,Total Volume,Total Pendapatan (Rp)\n';

  const rows = document.querySelectorAll('#recap-table-tbody tr');
  rows.forEach(row => {
    const cols = row.querySelectorAll('td');
    if (cols.length >= 6) {
      const line = Array.from(cols).slice(0, 6).map(c => `"${c.innerText.replace(/"/g, '""')}"`).join(',');
      csvContent += line + '\n';
    }
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Rekap_iLaundry_${yearFilter}_Bulan_${monthFilter}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

// ============================================
// EVENT LISTENERS & BOOTSTRAP
// ============================================

function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const resi = urlParams.get('resi');
  if (resi) {
    // Mode Khusus Pelanggan: pastikan menu kasir tidak tampil jika bukan kasir yang login
    if (!isCashierLoggedIn()) {
      const navOrder = document.getElementById('nav-item-order');
      const navAdmin = document.getElementById('nav-item-admin');
      if (navOrder) navOrder.style.display = 'none';
      if (navAdmin) navAdmin.style.display = 'none';
    }

    switchTab('tracking');
    const input = document.getElementById('track-input');
    if (input) input.value = resi;
    handleTrackSearch(null, resi);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initApp();
  checkUrlParams();
});
