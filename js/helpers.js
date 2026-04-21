// ═══════════════════════════════════════════════
// js/helpers.js — Utility Functions
// Small reusable helpers used across all pages.
// ═══════════════════════════════════════════════

// Format a number as Indian Rupees
function fmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

// Show a toast notification (bottom-right popup)
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

// Open the modal popup with a title and HTML body
function openModal(title, html) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('modalOverlay').classList.add('open');
}

// Close the modal
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

// Return a colored badge HTML for an order status
function sBadge(s) {
  const m = {
    Delivered: 'bg', Shipped: 'bb', Processing: 'bo',
    Pending: 'bgy', Cancelled: 'br',
    'Out for Delivery': 'bc', 'In Transit': 'bp'
  };
  return `<span class="badge ${m[s] || 'bgy'}">${s}</span>`;
}

// Live search filter on a table by column indices
function filterRows(tblId, val, cols) {
  document.querySelectorAll('#' + tblId + ' tbody tr').forEach(r => {
    const cells = [...r.querySelectorAll('td')];
    r.style.display = (!val || cols.some(i => cells[i] && cells[i].textContent.toLowerCase().includes(val.toLowerCase()))) ? '' : 'none';
  });
}

// Toggle a form panel open/closed
function tpanel(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('open');
}

// Clock tick — updates the topbar clock
function tick() {
  const e = document.getElementById('clock');
  if (e) e.textContent = new Date().toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit', second:'2-digit'});
}
