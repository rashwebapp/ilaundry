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
  // Cegah akses langsung ke tab admin tanpa otentikasi PIN
  if (tabId === 'admin' && !isAdminAuthenticated()) {
    openPinModal();
    return;
  }

  state.currentTab = tabId;

  // Toggle class active pada tombol navigasi
  document.querySelectorAll('.nav-item button').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`nav-${tabId}`);
  if (activeBtn) activeBtn.classList.add('active');

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
  showLoading(true, 'Memuat layanan dan data iLaundry...');
  const res = await fetchFromGAS('getData');

  if (res.success && res.data) {
    state.services = res.data.services || [];
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

function renderCatalog() {
  const container = document.getElementById('catalog-container');
  if (!container) return;

  if (state.services.length === 0) {
    container.innerHTML = '<div style="text-align:center;grid-column:1/-1;padding:20px;color:var(--text-muted);">Belum ada produk/layanan yang aktif.</div>';
    return;
  }

  container.innerHTML = state.services.map(srv => `
    <div class="service-card">
      <div>
        <span class="badge ${srv.jenis === 'Kiloan' ? 'badge-primary' : 'badge-warning'} service-badge">
          ${srv.jenis || 'Layanan'}
        </span>
        <h3 class="service-name">${srv.nama_layanan}</h3>
        <div class="service-price">${formatRupiah(srv.harga)} <span class="service-unit">/ ${srv.satuan}</span></div>
      </div>
      <div class="service-est">
        ⏱️ Estimasi selesai: <strong>${srv.estimasi_hari || 1} Hari</strong>
      </div>
    </div>
  `).join('');
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

async function handleCreateOrder(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-submit-order');
  btn.disabled = true;
  btn.textContent = 'Menyimpan pesanan...';

  const select = document.getElementById('order-layanan');
  const payload = {
    nama_pelanggan: document.getElementById('order-nama').value,
    no_whatsapp: document.getElementById('order-wa').value,
    layanan: select.value,
    jumlah: Number(document.getElementById('order-qty').value) || 1,
    total_biaya: calculateOrderTotal(),
    catatan: document.getElementById('order-catatan').value
  };

  showLoading(true, 'Menerbitkan resi dan menyimpan pesanan...');
  const res = await postToGAS('createOrder', payload);
  showLoading(false);

  btn.disabled = false;
  btn.textContent = '💾 Simpan Pesanan & Terbitkan Resi';

  if (res.success) {
    showToast(res.message, 'success');
    e.target.reset();
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
        status_bayar: 'Belum Lunas',
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
          <button class="btn btn-sm ${isLunas ? 'btn-success' : 'btn-danger'}" 
                  onclick="handleUpdateStatus('${order.id_pesanan}', null, '${nextPayStatus}')"
                  title="Klik untuk ubah status pembayaran">
            ${order.status_bayar || 'Belum Lunas'}
          </button>
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
    }
  } else {
    showToast(res.message || 'Gagal update status.', 'error');
  }
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
// OTENTIKASI & KEAMANAN PANEL KASIR (PIN)
// ============================================

function isAdminAuthenticated() {
  return sessionStorage.getItem('ilaundry_admin_auth') === 'true';
}

function requestAdminAccess() {
  if (isAdminAuthenticated()) {
    switchTab('admin');
  } else {
    openPinModal();
  }
}

function openPinModal() {
  const modal = document.getElementById('pin-modal');
  const input = document.getElementById('pin-input');
  if (modal) {
    modal.classList.add('show');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 150);
    }
  }
}

function closePinModal() {
  const modal = document.getElementById('pin-modal');
  if (modal) modal.classList.remove('show');
}

function handlePinSubmit(e) {
  e.preventDefault();
  const inputPin = document.getElementById('pin-input').value.trim();
  const correctPin = String(CONFIG.ADMIN_PIN || '1234').trim();

  if (inputPin === correctPin) {
    sessionStorage.setItem('ilaundry_admin_auth', 'true');
    closePinModal();
    showToast('Akses kasir berhasil dibuka.', 'success');
    switchTab('admin');
  } else {
    showToast('PIN Kasir salah! Akses ditolak.', 'error');
    const input = document.getElementById('pin-input');
    if (input) {
      input.value = '';
      input.focus();
    }
  }
}

function logoutAdmin() {
  sessionStorage.removeItem('ilaundry_admin_auth');
  showToast('Panel Kasir berhasil dikunci.', 'info');
  switchTab('tracking');
}

// ============================================
// EVENT LISTENERS & BOOTSTRAP
// ============================================

function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const resi = urlParams.get('resi');
  if (resi) {
    // Mode Khusus Pelanggan: Sembunyikan menu Kasir dan Order Baru dari navbar
    const navAdmin = document.getElementById('nav-item-admin');
    const navOrder = document.getElementById('nav-item-order');
    if (navAdmin) navAdmin.style.display = 'none';
    if (navOrder) navOrder.style.display = 'none';

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
