// ═══════════════════════════════════════════════
// pages/admin.js — Admin Pages
// Dashboard, Orders, Products, Customers, Agents
// ═══════════════════════════════════════════════

// ── DASHBOARD ──
function pgAdminDash(c) {
  const ao   = allOrders();
  const pend = ao.filter(o => o.status === 'Pending').length;
  const rev  = totalRevenue();
  const mdata = [142,98,178,134,201,165,189];
  const mx    = Math.max(...mdata);
  c.innerHTML = `
  <div class="g4" style="margin-bottom:16px">
    <div class="sc" data-icon="📦"><div class="sc-lbl">Total Orders</div><div class="sc-val">${DB.orders.length}</div><div class="sc-sub up">↑ 12.5% this month</div></div>
    <div class="sc" data-icon="💰"><div class="sc-lbl">Total Revenue</div><div class="sc-val">${fmt(rev)}</div><div class="sc-sub up">↑ 8.2% this month</div></div>
    <div class="sc" data-icon="🏪"><div class="sc-lbl">Products</div><div class="sc-val">${DB.products.length}</div><div class="sc-sub up">↑ ${DB.products.filter(p=>p.stock>0).length} in stock</div></div>
    <div class="sc" data-icon="⏳"><div class="sc-lbl">Pending Orders</div><div class="sc-val wa">${pend}</div><div class="sc-sub dn">${pend} need action</div></div>
  </div>
  <div class="g2">
    <div class="card">
      <div class="ch"><span class="ct">Recent Orders</span><button class="btn btn-out btn-sm" onclick="goto('orders')">View All</button></div>
      <table><thead><tr><th>Order</th><th>Customer</th><th>Product</th><th>Status</th><th>Amount</th></tr></thead>
      <tbody>${ao.slice(0,6).map(o=>`<tr><td><b>${o.oid}</b></td><td>${o.customerName}</td><td>${o.productName}</td><td>${sBadge(o.status)}</td><td>${fmt(o.amount)}</td></tr>`).join('')}</tbody></table>
    </div>
    <div class="card">
      <div class="ch"><span class="ct">Monthly Sales Trend</span></div>
      <div style="padding:16px">
        <div class="minibars">${['Jan','Feb','Mar','Apr','May','Jun','Jul'].map((m,i)=>`<div style="display:flex;flex-direction:column;align-items:center;flex:1;gap:4px"><div class="minibar" style="height:${Math.round(mdata[i]/mx*70)+10}px"></div><div style="font-size:9px;color:var(--muted)">${m}</div></div>`).join('')}</div>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="ch"><span class="ct">Top Products by Sales</span><button class="btn btn-out btn-sm" onclick="resetDB()">🔄 Reset Data</button></div>
    <table><thead><tr><th>Product</th><th>Category</th><th>Units Sold</th><th>Revenue</th><th>Stock</th><th>Rating</th></tr></thead>
    <tbody>${topProductsBySales().slice(0,6).map(p=>`<tr><td><b>${p.name}</b></td><td>${p.category}</td><td>${p.sold}</td><td>${fmt(p.price*p.sold)}</td><td style="color:${p.stock===0?'var(--err)':p.stock<20?'var(--warn)':'var(--ok)'}"><b>${p.stock}</b></td><td>⭐${p.rating}</td></tr>`).join('')}</tbody></table>
  </div>`;
}

// ── ORDERS ──
function pgOrders(c) {
  const ao = allOrders();
  c.innerHTML = `
  <div class="toolbar">
    <div class="swrap" style="flex:1;max-width:280px"><input placeholder="Search orders..." oninput="filterRows('ordTbl',this.value,[0,1,2,4])"></div>
    <select onchange="filterOrderStatus(this.value)" style="width:auto">
      <option value="">All Status</option>
      ${['Pending','Processing','Shipped','Delivered','Cancelled'].map(s=>`<option>${s}</option>`).join('')}
    </select>
    <button class="btn btn-pri" onclick="openAddOrder()">+ Add Order</button>
  </div>
  <div class="card">
    <table id="ordTbl">
      <thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Qty</th><th>Status</th><th>Amount</th><th>Agent</th><th>Date</th><th>Actions</th></tr></thead>
      <tbody>${ao.map(o=>`<tr>
        <td><b>${o.oid}</b></td><td>${o.customerName}</td><td>${o.productName}</td><td>${o.qty}</td>
        <td>${sBadge(o.status)}</td><td>${fmt(o.amount)}</td><td>${o.agentName}</td><td>${o.date}</td>
        <td style="display:flex;gap:4px">
          <button class="btn btn-out btn-sm"  onclick="openEditOrder(${o.id})">✏️</button>
          <button class="btn btn-warn btn-sm" onclick="cycleOrderStatus(${o.id})">↻</button>
          <button class="btn btn-err btn-sm"  onclick="deleteOrder(${o.id})">🗑</button>
        </td></tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}
function filterOrderStatus(val) { filterRows('ordTbl', val, [4]); }
function openAddOrder() {
  openModal('Add New Order', `
    <div class="g2">
      <div class="fg"><label>Customer</label><select id="ao-cust">${custOpts()}</select></div>
      <div class="fg"><label>Product</label><select id="ao-prod" onchange="updAOTotal()">${prodOpts(false)}</select></div>
    </div>
    <div class="g3">
      <div class="fg"><label>Qty</label><input type="number" id="ao-qty" value="1" min="1" oninput="updAOTotal()"></div>
      <div class="fg"><label>Total</label><input id="ao-total" readonly></div>
      <div class="fg"><label>Payment</label><select id="ao-pay"><option>UPI</option><option>Credit Card</option><option>COD</option><option>Net Banking</option></select></div>
    </div>
    <div class="g2">
      <div class="fg"><label>Status</label><select id="ao-st">${['Pending','Processing','Shipped','Delivered','Cancelled'].map(s=>`<option>${s}</option>`).join('')}</select></div>
      <div class="fg"><label>Agent</label><select id="ao-ag">${agentOpts()}</select></div>
    </div>
    <div class="fg"><label>Delivery Address</label><input id="ao-addr" placeholder="Full address"></div>
    <button class="btn btn-pri" onclick="saveNewOrder()">✓ Add Order</button>
  `);
  setTimeout(updAOTotal, 100);
}
function updAOTotal() {
  const s = document.getElementById('ao-prod');
  const q = parseInt(document.getElementById('ao-qty')?.value) || 1;
  if (!s) return;
  const p = getProduct(parseInt(s.value));
  const el = document.getElementById('ao-total');
  if (el && p) el.value = fmt(p.price * q);
}
function saveNewOrder() {
  const prodId = parseInt(document.getElementById('ao-prod').value);
  const custId = parseInt(document.getElementById('ao-cust').value);
  const qty    = parseInt(document.getElementById('ao-qty').value) || 1;
  const p = getProduct(prodId); if (!p) { showToast('Select a product'); return; }
  const newId  = DB._nextOrderId++;
  const oid    = 'ORD-' + String(newId).padStart(3,'0');
  DB.orders.push({id:newId, oid, custId, prodId, qty, amount:p.price*qty,
    status:document.getElementById('ao-st').value,
    payment:document.getElementById('ao-pay').value,
    agentId:parseInt(document.getElementById('ao-ag').value)||0,
    address:document.getElementById('ao-addr').value.trim(),
    date:new Date().toISOString().split('T')[0]});
  p.sold += qty; p.stock = Math.max(0, p.stock - qty);
  saveDB(); closeModal(); showToast(oid + ' created ✅'); goto('orders');
}
function openEditOrder(id) {
  const o = DB.orders.find(x => x.id === id); if (!o) return;
  openModal('Edit Order: ' + o.oid, `
    <div class="g2">
      <div class="fg"><label>Customer</label><select id="eo-cust">${custOpts().replace(`value="${o.custId}"`,`value="${o.custId}" selected`)}</select></div>
      <div class="fg"><label>Product</label><select id="eo-prod">${prodOpts(false).replace(`value="${o.prodId}"`,`value="${o.prodId}" selected`)}</select></div>
    </div>
    <div class="g3">
      <div class="fg"><label>Qty</label><input type="number" id="eo-qty" value="${o.qty}"></div>
      <div class="fg"><label>Amount (₹)</label><input type="number" id="eo-amt" value="${o.amount}"></div>
      <div class="fg"><label>Payment</label><select id="eo-pay">${['UPI','Credit Card','COD','Net Banking'].map(s=>`<option ${s===o.payment?'selected':''}>${s}</option>`).join('')}</select></div>
    </div>
    <div class="g2">
      <div class="fg"><label>Status</label><select id="eo-st">${['Pending','Processing','Shipped','Out for Delivery','Delivered','Cancelled'].map(s=>`<option ${s===o.status?'selected':''}>${s}</option>`).join('')}</select></div>
      <div class="fg"><label>Agent</label><select id="eo-ag">${agentOpts().replace(`value="${o.agentId}"`,`value="${o.agentId}" selected`)}</select></div>
    </div>
    <div class="fg"><label>Delivery Address</label><input id="eo-addr" value="${o.address||''}"></div>
    <button class="btn btn-pri" onclick="saveEditOrder(${id})">✓ Save Changes</button>
  `);
}
function saveEditOrder(id) {
  const o = DB.orders.find(x => x.id === id); if (!o) return;
  o.custId  = parseInt(document.getElementById('eo-cust').value);
  o.prodId  = parseInt(document.getElementById('eo-prod').value);
  o.qty     = parseInt(document.getElementById('eo-qty').value) || 1;
  o.amount  = parseInt(document.getElementById('eo-amt').value) || 0;
  o.status  = document.getElementById('eo-st').value;
  o.payment = document.getElementById('eo-pay').value;
  o.agentId = parseInt(document.getElementById('eo-ag').value) || 0;
  o.address = document.getElementById('eo-addr').value.trim();
  saveDB(); closeModal(); showToast('Order updated ✅'); goto('orders');
}
function cycleOrderStatus(id) {
  const o = DB.orders.find(x => x.id === id); if (!o) return;
  const st = ['Pending','Processing','Shipped','Delivered','Cancelled'];
  o.status = st[(st.indexOf(o.status) + 1) % st.length];
  saveDB(); showToast(o.oid + ' → ' + o.status); goto('orders');
}
function deleteOrder(id) {
  if (!confirm('Delete this order?')) return;
  DB.orders = DB.orders.filter(x => x.id !== id);
  saveDB(); showToast('Order deleted'); goto('orders');
}

// ── PRODUCTS ──
function pgProducts(c) {
  c.innerHTML = `
  <div class="toolbar">
    <div class="swrap" style="flex:1;max-width:280px"><input placeholder="Search products..." oninput="filterRows('prodTbl',this.value,[1,2,5])"></div>
    <select onchange="filterProdCat(this.value)" style="width:auto">
      <option value="">All Categories</option>
      ${[...new Set(DB.products.map(p=>p.category))].map(c=>`<option>${c}</option>`).join('')}
    </select>
    <button class="btn btn-pri" onclick="openAddProduct()">+ Add Product</button>
  </div>
  <div class="card">
    <table id="prodTbl">
      <thead><tr><th>#</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Seller</th><th>Rating</th><th>Sold</th><th>Actions</th></tr></thead>
      <tbody>${DB.products.map(p=>`<tr>
        <td>${p.id}</td><td><b>${p.name}</b></td><td>${p.category}</td><td>${fmt(p.price)}</td>
        <td style="font-weight:700;color:${p.stock===0?'var(--err)':p.stock<20?'var(--warn)':'var(--ok)'}">${p.stock}</td>
        <td>${p.seller}</td><td>⭐${p.rating}</td><td>${p.sold}</td>
        <td style="display:flex;gap:4px">
          <button class="btn btn-out btn-sm" onclick="openEditProduct(${p.id})">✏️</button>
          <button class="btn btn-err btn-sm" onclick="deleteProduct(${p.id})">🗑</button>
        </td></tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}
function filterProdCat(cat) { filterRows('prodTbl', cat, [2]); }
function openAddProduct() {
  openModal('Add New Product', `
    <div class="g2">
      <div class="fg"><label>Product Name</label><input id="ap-name" placeholder="e.g. iPhone 15"></div>
      <div class="fg"><label>Category</label>
        <select id="ap-cat"><option>Electronics</option><option>Clothing</option><option>Sports</option><option>Home</option><option>Books</option><option>Beauty</option><option>Food</option><option>Toys</option></select>
      </div>
    </div>
    <div class="g3">
      <div class="fg"><label>Price (₹)</label><input type="number" id="ap-price" placeholder="0"></div>
      <div class="fg"><label>Stock</label><input type="number" id="ap-stock" placeholder="0"></div>
      <div class="fg"><label>Rating (1-5)</label><input type="number" id="ap-rating" value="4.0" step="0.1" min="1" max="5"></div>
    </div>
    <div class="g2">
      <div class="fg"><label>Seller / Store Name</label><input id="ap-seller" placeholder="e.g. TechWorld Store"></div>
      <div class="fg"><label>Units Sold (initial)</label><input type="number" id="ap-sold" value="0"></div>
    </div>
    <div class="fg"><label>Description</label><input id="ap-desc" placeholder="Short product description"></div>
    <button class="btn btn-pri" onclick="saveNewProduct()">✓ Add Product</button>
  `);
}
function saveNewProduct() {
  const name = document.getElementById('ap-name').value.trim();
  if (!name) { showToast('Enter product name'); return; }
  DB.products.push({
    id:DB._nextProdId++, name,
    category: document.getElementById('ap-cat').value,
    price:    parseInt(document.getElementById('ap-price').value) || 0,
    stock:    parseInt(document.getElementById('ap-stock').value) || 0,
    rating:   parseFloat(document.getElementById('ap-rating').value) || 4.0,
    seller:   document.getElementById('ap-seller').value || curUser.name,
    sellerId: curUser.id,
    sold:     parseInt(document.getElementById('ap-sold').value) || 0,
    desc:     document.getElementById('ap-desc').value,
  });
  saveDB(); closeModal(); showToast('Product added ✅'); goto('products');
}
function openEditProduct(id) {
  const p = DB.products.find(x => x.id === id); if (!p) return;
  openModal('Edit Product: ' + p.name, `
    <div class="g2">
      <div class="fg"><label>Product Name</label><input id="ep-name" value="${p.name}"></div>
      <div class="fg"><label>Category</label>
        <select id="ep-cat">${['Electronics','Clothing','Sports','Home','Books','Beauty','Food','Toys'].map(c=>`<option ${c===p.category?'selected':''}>${c}</option>`).join('')}</select>
      </div>
    </div>
    <div class="g3">
      <div class="fg"><label>Price (₹)</label><input type="number" id="ep-price" value="${p.price}"></div>
      <div class="fg"><label>Stock</label><input type="number" id="ep-stock" value="${p.stock}"></div>
      <div class="fg"><label>Rating</label><input type="number" id="ep-rating" value="${p.rating}" step="0.1" min="1" max="5"></div>
    </div>
    <div class="g2">
      <div class="fg"><label>Seller</label><input id="ep-seller" value="${p.seller}"></div>
      <div class="fg"><label>Units Sold</label><input type="number" id="ep-sold" value="${p.sold}"></div>
    </div>
    <div class="fg"><label>Description</label><input id="ep-desc" value="${p.desc||''}"></div>
    <button class="btn btn-pri" onclick="saveEditProduct(${id})">✓ Save Changes</button>
  `);
}
function saveEditProduct(id) {
  const p = DB.products.find(x => x.id === id); if (!p) return;
  p.name     = document.getElementById('ep-name').value.trim();
  p.category = document.getElementById('ep-cat').value;
  p.price    = parseInt(document.getElementById('ep-price').value) || 0;
  p.stock    = parseInt(document.getElementById('ep-stock').value) || 0;
  p.rating   = parseFloat(document.getElementById('ep-rating').value) || 4;
  p.seller   = document.getElementById('ep-seller').value;
  p.sold     = parseInt(document.getElementById('ep-sold').value) || 0;
  p.desc     = document.getElementById('ep-desc').value;
  saveDB(); closeModal(); showToast('Product updated ✅'); goto('products');
}
function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  DB.products = DB.products.filter(p => p.id !== id);
  saveDB(); showToast('Product deleted'); goto(curPage);
}

// ── CUSTOMERS ──
function pgCustomers(c) {
  c.innerHTML = `
  <div class="toolbar">
    <div class="swrap" style="flex:1;max-width:280px"><input placeholder="Search customers..." oninput="filterRows('custTbl',this.value,[1,2,4])"></div>
    <button class="btn btn-pri" onclick="openAddCustomer()">+ Add Customer</button>
  </div>
  <div class="card">
    <table id="custTbl">
      <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>City</th><th>Orders</th><th>Total Spent</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${DB.customers.map(cu => {
        const ords  = ordersByCustomer(cu.id).length;
        const spent = totalSpentByCustomer(cu.id);
        return `<tr>
          <td>${cu.id}</td><td><b>${cu.name}</b></td><td>${cu.email}</td><td>${cu.phone}</td><td>${cu.city}</td>
          <td>${ords}</td><td>${fmt(spent)}</td><td>${sBadge(cu.status)}</td>
          <td style="display:flex;gap:4px">
            <button class="btn btn-out btn-sm" onclick="openEditCustomer(${cu.id})">✏️</button>
            <button class="btn btn-err btn-sm" onclick="deleteCustomer(${cu.id})">🗑</button>
          </td></tr>`;
      }).join('')}</tbody>
    </table>
  </div>`;
}
function openAddCustomer() {
  openModal('Add New Customer', `
    <div class="g2">
      <div class="fg"><label>Full Name</label><input id="ac-name" placeholder="Full Name"></div>
      <div class="fg"><label>Email</label><input id="ac-email" type="email" placeholder="email@example.com"></div>
    </div>
    <div class="g2">
      <div class="fg"><label>Phone</label><input id="ac-phone" placeholder="9876543210"></div>
      <div class="fg"><label>City</label><input id="ac-city" placeholder="Mumbai"></div>
    </div>
    <div class="fg"><label>Status</label><select id="ac-status"><option>Active</option><option>Inactive</option></select></div>
    <button class="btn btn-pri" onclick="saveNewCustomer()">✓ Add Customer</button>
  `);
}
function saveNewCustomer() {
  const name = document.getElementById('ac-name').value.trim();
  if (!name) { showToast('Enter customer name'); return; }
  DB.customers.push({id:DB._nextCustId++, name,
    email:  document.getElementById('ac-email').value.trim(),
    phone:  document.getElementById('ac-phone').value.trim(),
    city:   document.getElementById('ac-city').value.trim(),
    status: document.getElementById('ac-status').value});
  saveDB(); closeModal(); showToast('Customer added ✅'); goto('customers');
}
function openEditCustomer(id) {
  const cu = DB.customers.find(x => x.id === id); if (!cu) return;
  openModal('Edit Customer: ' + cu.name, `
    <div class="g2">
      <div class="fg"><label>Full Name</label><input id="ec-name" value="${cu.name}"></div>
      <div class="fg"><label>Email</label><input id="ec-email" value="${cu.email}"></div>
    </div>
    <div class="g2">
      <div class="fg"><label>Phone</label><input id="ec-phone" value="${cu.phone}"></div>
      <div class="fg"><label>City</label><input id="ec-city" value="${cu.city}"></div>
    </div>
    <div class="fg"><label>Status</label><select id="ec-status"><option ${cu.status==='Active'?'selected':''}>Active</option><option ${cu.status==='Inactive'?'selected':''}>Inactive</option></select></div>
    <button class="btn btn-pri" onclick="saveEditCustomer(${id})">✓ Save Changes</button>
  `);
}
function saveEditCustomer(id) {
  const cu = DB.customers.find(x => x.id === id); if (!cu) return;
  cu.name   = document.getElementById('ec-name').value.trim();
  cu.email  = document.getElementById('ec-email').value.trim();
  cu.phone  = document.getElementById('ec-phone').value.trim();
  cu.city   = document.getElementById('ec-city').value.trim();
  cu.status = document.getElementById('ec-status').value;
  saveDB(); closeModal(); showToast('Customer updated ✅'); goto('customers');
}
function deleteCustomer(id) {
  if (!confirm('Delete this customer?')) return;
  DB.customers = DB.customers.filter(x => x.id !== id);
  saveDB(); showToast('Customer deleted'); goto('customers');
}

// ── AGENTS ──
function pgAgents(c) {
  c.innerHTML = `
  <div class="toolbar">
    <div class="swrap" style="flex:1;max-width:280px"><input placeholder="Search agents..." oninput="filterRows('agTbl',this.value,[1,3,4])"></div>
    <button class="btn btn-pri" onclick="openAddAgent()">+ Add Agent</button>
  </div>
  <div class="card">
    <table id="agTbl">
      <thead><tr><th>#</th><th>Name</th><th>Phone</th><th>City</th><th>Zone</th><th>Active</th><th>Deliveries</th><th>Actions</th></tr></thead>
      <tbody>${DB.agents.map(a => {
        const dels = DB.orders.filter(o => o.agentId === a.id).length;
        return `<tr>
          <td>${a.id}</td><td><b>${a.name}</b></td><td>${a.phone}</td><td>${a.city}</td><td>${a.zone}</td>
          <td>${a.active ? '<span class="badge bg">Active</span>' : '<span class="badge br">Inactive</span>'}</td>
          <td>${dels}</td>
          <td style="display:flex;gap:4px">
            <button class="btn btn-out btn-sm" onclick="openEditAgent(${a.id})">✏️</button>
            <button class="btn btn-err btn-sm" onclick="deleteAgent(${a.id})">🗑</button>
          </td></tr>`;
      }).join('')}</tbody>
    </table>
  </div>`;
}
function openAddAgent() {
  openModal('Add Delivery Agent', `
    <div class="g2">
      <div class="fg"><label>Full Name</label><input id="aa-name" placeholder="Agent Name"></div>
      <div class="fg"><label>Phone</label><input id="aa-phone" placeholder="9876543210"></div>
    </div>
    <div class="g2">
      <div class="fg"><label>City</label><input id="aa-city" placeholder="Mumbai"></div>
      <div class="fg"><label>Zone</label><input id="aa-zone" placeholder="e.g. North, South, West"></div>
    </div>
    <div class="fg"><label>Status</label><select id="aa-active"><option value="1">Active</option><option value="0">Inactive</option></select></div>
    <button class="btn btn-pri" onclick="saveNewAgent()">✓ Add Agent</button>
  `);
}
function saveNewAgent() {
  const name = document.getElementById('aa-name').value.trim();
  if (!name) { showToast('Enter agent name'); return; }
  DB.agents.push({id:DB._nextAgentId++, name,
    phone:  document.getElementById('aa-phone').value.trim(),
    city:   document.getElementById('aa-city').value.trim(),
    zone:   document.getElementById('aa-zone').value.trim() || '-',
    active: document.getElementById('aa-active').value === '1'});
  saveDB(); closeModal(); showToast('Agent added ✅'); goto('agents');
}
function openEditAgent(id) {
  const a = DB.agents.find(x => x.id === id); if (!a) return;
  openModal('Edit Agent: ' + a.name, `
    <div class="g2">
      <div class="fg"><label>Name</label><input id="ea-name" value="${a.name}"></div>
      <div class="fg"><label>Phone</label><input id="ea-phone" value="${a.phone}"></div>
    </div>
    <div class="g2">
      <div class="fg"><label>City</label><input id="ea-city" value="${a.city}"></div>
      <div class="fg"><label>Zone</label><input id="ea-zone" value="${a.zone}"></div>
    </div>
    <div class="fg"><label>Status</label><select id="ea-active"><option value="1" ${a.active?'selected':''}>Active</option><option value="0" ${!a.active?'selected':''}>Inactive</option></select></div>
    <button class="btn btn-pri" onclick="saveEditAgent(${id})">✓ Save Changes</button>
  `);
}
function saveEditAgent(id) {
  const a = DB.agents.find(x => x.id === id); if (!a) return;
  a.name   = document.getElementById('ea-name').value.trim();
  a.phone  = document.getElementById('ea-phone').value.trim();
  a.city   = document.getElementById('ea-city').value.trim();
  a.zone   = document.getElementById('ea-zone').value.trim();
  a.active = document.getElementById('ea-active').value === '1';
  saveDB(); closeModal(); showToast('Agent updated ✅'); goto('agents');
}
function deleteAgent(id) {
  if (!confirm('Delete this agent?')) return;
  DB.agents = DB.agents.filter(x => x.id !== id);
  saveDB(); showToast('Agent deleted'); goto('agents');
}
