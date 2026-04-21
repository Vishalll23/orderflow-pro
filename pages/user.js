// ═══════════════════════════════════════════════
// pages/user.js — Customer, Seller, Delivery Agent Pages
// ═══════════════════════════════════════════════

// ── CUSTOMER DASHBOARD ──
function pgCustDash(c) {
  const cu     = DB.customers.find(x => x.name === curUser.name);
  const myOrds = cu ? DB.orders.filter(o => o.custId === cu.id).map(enrichOrder) : [];
  const spent  = myOrds.reduce((s,o) => s + o.amount, 0);
  c.innerHTML = `
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:16px">
    <div class="sc" data-icon="📦"><div class="sc-lbl">My Orders</div><div class="sc-val">${myOrds.length}</div></div>
    <div class="sc" data-icon="💰"><div class="sc-lbl">Total Spent</div><div class="sc-val">${fmt(spent)}</div></div>
    <div class="sc" data-icon="🚚"><div class="sc-lbl">In Transit</div><div class="sc-val">${myOrds.filter(o=>['Shipped','Processing','Out for Delivery'].includes(o.status)).length}</div></div>
  </div>
  <div class="card">
    <div class="ch"><span class="ct">My Recent Orders</span><button class="btn btn-pri btn-sm" onclick="goto('place-order')">+ New Order</button></div>
    ${myOrds.length
      ? `<table><thead><tr><th>Order ID</th><th>Product</th><th>Qty</th><th>Date</th><th>Status</th><th>Amount</th></tr></thead>
         <tbody>${myOrds.map(o=>`<tr><td><b>${o.oid}</b></td><td>${o.productName}</td><td>${o.qty}</td><td>${o.date}</td><td>${sBadge(o.status)}</td><td>${fmt(o.amount)}</td></tr>`).join('')}</tbody></table>`
      : `<div style="padding:40px;text-align:center;color:var(--muted)">No orders yet. <span style="color:var(--pri);cursor:pointer" onclick="goto('place-order')">Place your first order!</span></div>`}
  </div>`;
}

// ── PLACE ORDER ──
function pgPlaceOrder(c) {
  c.innerHTML = `
  <div class="g2">
    <div class="card">
      <div class="ch"><span class="ct">Place New Order</span></div>
      <div style="padding:16px">
        <div class="fg"><label>Select Product</label><select id="po-prod" onchange="updPoP()" style="width:100%">${prodOpts(true)}</select></div>
        <div class="g2">
          <div class="fg"><label>Quantity</label><input type="number" id="po-qty" value="1" min="1" oninput="updPoP()"></div>
          <div class="fg"><label>Total Amount</label><input id="po-total" readonly></div>
        </div>
        <div class="fg"><label>Delivery Address</label><textarea id="po-addr" rows="2" placeholder="Your full delivery address"></textarea></div>
        <div class="fg"><label>Payment Method</label><select id="po-pay"><option>UPI</option><option>Credit Card</option><option>COD</option><option>Net Banking</option></select></div>
        <button class="btn btn-pri" style="margin-top:4px" onclick="placeOrder_()">🛍 Place Order</button>
      </div>
    </div>
    <div class="card">
      <div class="ch"><span class="ct">Available Products</span></div>
      <table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th></tr></thead>
      <tbody>${DB.products.map(p=>`<tr><td><b>${p.name}</b></td><td>${p.category}</td><td>${fmt(p.price)}</td><td style="color:${p.stock===0?'var(--err)':p.stock<20?'var(--warn)':'var(--ok)'}"><b>${p.stock}</b></td><td>⭐${p.rating}</td></tr>`).join('')}</tbody></table>
    </div>
  </div>`;
  setTimeout(updPoP, 100);
}
function updPoP() {
  const s = document.getElementById('po-prod');
  const q = parseInt(document.getElementById('po-qty')?.value) || 1;
  if (!s) return;
  const p  = getProduct(parseInt(s.value));
  const el = document.getElementById('po-total');
  if (el && p) el.value = fmt(p.price * q);
}
function placeOrder_() {
  const prodId = parseInt(document.getElementById('po-prod').value);
  const qty    = parseInt(document.getElementById('po-qty').value) || 1;
  const p      = getProduct(prodId); if (!p) { showToast('Select a product'); return; }
  const cu     = DB.customers.find(x => x.name === curUser.name) || DB.customers[0];
  const newId  = DB._nextOrderId++;
  const oid    = 'ORD-' + String(newId).padStart(3,'0');
  DB.orders.push({id:newId, oid, custId:cu.id, prodId, qty, amount:p.price*qty,
    status:'Pending', payment:document.getElementById('po-pay').value,
    agentId:0, address:document.getElementById('po-addr').value.trim(),
    date:new Date().toISOString().split('T')[0]});
  p.sold += qty; p.stock = Math.max(0, p.stock - qty);
  saveDB(); showToast(oid + ' placed! ✅'); goto('my-orders');
}

// ── MY ORDERS ──
function pgMyOrders(c) {
  const cu    = DB.customers.find(x => x.name === curUser.name);
  const myOrds = cu ? DB.orders.filter(o => o.custId === cu.id).map(enrichOrder) : [];
  c.innerHTML = `<div class="card">
    <div class="ch"><span class="ct">My Orders (${myOrds.length})</span><button class="btn btn-pri btn-sm" onclick="goto('place-order')">+ New Order</button></div>
    ${myOrds.length
      ? `<table><thead><tr><th>Order ID</th><th>Product</th><th>Qty</th><th>Date</th><th>Status</th><th>Amount</th><th>Payment</th></tr></thead>
         <tbody>${myOrds.map(o=>`<tr><td><b>${o.oid}</b></td><td>${o.productName}</td><td>${o.qty}</td><td>${o.date}</td><td>${sBadge(o.status)}</td><td>${fmt(o.amount)}</td><td>${o.payment}</td></tr>`).join('')}</tbody></table>`
      : `<div style="padding:40px;text-align:center;color:var(--muted)">No orders yet.</div>`}
  </div>`;
}

// ── SELLER DASHBOARD ──
function pgSellDash(c) {
  const myP    = DB.products.filter(p => p.sellerId === curUser.id || p.seller === (curUser.shop || curUser.name));
  const myPIds = myP.map(p => p.id);
  const myOrds = DB.orders.filter(o => myPIds.includes(o.prodId)).map(enrichOrder);
  const rev    = myOrds.reduce((s,o) => s + o.amount, 0);
  c.innerHTML = `
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:16px">
    <div class="sc" data-icon="🏪"><div class="sc-lbl">My Products</div><div class="sc-val">${myP.length || DB.products.length}</div></div>
    <div class="sc" data-icon="📦"><div class="sc-lbl">Orders Received</div><div class="sc-val">${myOrds.length || DB.orders.length}</div></div>
    <div class="sc" data-icon="💰"><div class="sc-lbl">My Revenue</div><div class="sc-val">${fmt(rev || totalRevenue())}</div></div>
  </div>
  <div class="card">
    <div class="ch"><span class="ct">Recent Orders</span></div>
    <table><thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Qty</th><th>Status</th><th>Amount</th></tr></thead>
    <tbody>${(myOrds.length ? myOrds : allOrders()).slice(0,8).map(o=>`<tr><td><b>${o.oid}</b></td><td>${o.customerName}</td><td>${o.productName}</td><td>${o.qty}</td><td>${sBadge(o.status)}</td><td>${fmt(o.amount)}</td></tr>`).join('')}</tbody></table>
  </div>`;
}
function pgManageProducts(c) { pgProducts(c); }

// ── DELIVERY AGENT DASHBOARD ──
function pgDelDash(c) {
  const myAgent = DB.agents.find(a => a.name === curUser.name);
  const myDels  = myAgent ? DB.orders.filter(o => o.agentId === myAgent.id).map(enrichOrder) : allOrders();
  c.innerHTML = `
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:16px">
    <div class="sc" data-icon="🚚"><div class="sc-lbl">Assigned</div><div class="sc-val">${myDels.length}</div></div>
    <div class="sc" data-icon="✅"><div class="sc-lbl">Delivered</div><div class="sc-val" style="color:var(--ok)">${myDels.filter(d=>d.status==='Delivered').length}</div></div>
    <div class="sc" data-icon="⏳"><div class="sc-lbl">Pending</div><div class="sc-val" style="color:var(--warn)">${myDels.filter(d=>d.status!=='Delivered'&&d.status!=='Cancelled').length}</div></div>
  </div>
  <div class="card">
    <div class="ch"><span class="ct">My Deliveries</span></div>
    <table><thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Address</th><th>Status</th><th>Action</th></tr></thead>
    <tbody>${myDels.map(o=>`<tr>
      <td><b>${o.oid}</b></td><td>${o.customerName}</td><td>${o.productName}</td>
      <td style="font-size:12px;color:var(--muted)">${o.address||'-'}</td><td>${sBadge(o.status)}</td>
      <td><button class="btn btn-warn btn-sm" onclick="advanceDelivery(${o.id});pgDelDash(document.getElementById('content'))">↻ Update</button></td>
    </tr>`).join('')}</tbody></table>
  </div>`;
}
