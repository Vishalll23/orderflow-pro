// ═══════════════════════════════════════════════
// pages/analytics.js — Analytics, SQL, Inventory, Delivery, Settings
// ═══════════════════════════════════════════════

// ── ANALYTICS ──
function pgAnalytics(c) {
  const catData = revenueByCategory();
  const maxRev  = catData[0]?.rev || 1;
  const custData = DB.customers.map(cu => ({...cu, orders:ordersByCustomer(cu.id).length, spent:totalSpentByCustomer(cu.id)})).sort((a,b)=>b.spent-a.spent);
  const maxSpent = custData[0]?.spent || 1;
  c.innerHTML = `
  <div class="g4" style="margin-bottom:16px">
    <div class="sc" data-icon="💰"><div class="sc-lbl">Total Revenue</div><div class="sc-val">${fmt(totalRevenue())}</div></div>
    <div class="sc" data-icon="📦"><div class="sc-lbl">Total Orders</div><div class="sc-val">${DB.orders.length}</div></div>
    <div class="sc" data-icon="✅"><div class="sc-lbl">Delivered</div><div class="sc-val" style="color:var(--ok)">${DB.orders.filter(o=>o.status==='Delivered').length}</div></div>
    <div class="sc" data-icon="⏳"><div class="sc-lbl">Pending</div><div class="sc-val" style="color:var(--warn)">${DB.orders.filter(o=>o.status==='Pending').length}</div></div>
  </div>
  <div class="g2">
    <div class="card">
      <div class="ch"><span class="ct">Revenue by Category</span></div>
      <div style="padding:16px">${catData.map(d=>{
        const pct=Math.round(d.rev/maxRev*100);
        return`<div class="barrow"><div class="barlbl">${d.cat}</div><div class="bartrack"><div class="barfill" style="width:${pct}%;background:linear-gradient(90deg,var(--pri),var(--acc))">${fmt(d.rev)}</div></div></div>`;
      }).join('')}</div>
    </div>
    <div class="card">
      <div class="ch"><span class="ct">Order Status Breakdown</span></div>
      <div style="padding:16px">${['Pending','Processing','Shipped','Delivered','Cancelled'].map(st=>{
        const cnt=DB.orders.filter(o=>o.status===st).length;
        const pct=DB.orders.length?Math.round(cnt/DB.orders.length*100):0;
        const colors={Delivered:'var(--ok)',Pending:'var(--warn)',Cancelled:'var(--err)',Shipped:'var(--pri)',Processing:'#7c3aed'};
        return`<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:12px">${st}</span><span style="font-size:12px;font-weight:700">${cnt} (${pct}%)</span></div><div class="progwrap"><div class="prog" style="width:${pct}%;background:${colors[st]||'var(--pri)'}"></div></div></div>`;
      }).join('')}</div>
    </div>
  </div>
  <div class="card">
    <div class="ch"><span class="ct">Customer Leaderboard — Top Spenders</span></div>
    <table><thead><tr><th>Rank</th><th>Customer</th><th>City</th><th>Orders</th><th>Total Spent</th><th>Avg Order</th><th>Share</th></tr></thead>
    <tbody>${custData.slice(0,8).map((cu,i)=>{
      const pct=Math.round(cu.spent/maxSpent*100);
      return`<tr><td><b>#${i+1}</b></td><td>${cu.name}</td><td>${cu.city}</td><td>${cu.orders}</td><td>${fmt(cu.spent)}</td><td>${fmt(Math.round(cu.spent/Math.max(1,cu.orders)))}</td>
      <td><div style="display:flex;align-items:center;gap:8px"><div style="flex:1;background:#f1f5fb;border-radius:4px;height:8px"><div style="width:${pct}%;background:var(--pri);height:100%;border-radius:4px"></div></div><span style="font-size:11px">${pct}%</span></div></td></tr>`;
    }).join('')}</tbody></table>
  </div>`;
}

// ── SQL REPORTS ──
function pgReports(c) {
  c.innerHTML = `
  <div class="card" style="margin-bottom:16px">
    <div class="ch"><span class="ct">SQL Query Builder</span><span style="font-size:11px;color:var(--muted)">Results reflect live data — try adding orders/products first!</span></div>
    <div style="padding:16px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
        <button class="btn btn-out btn-sm" onclick="runQ('join')">INNER JOIN</button>
        <button class="btn btn-out btn-sm" onclick="runQ('left_join')">LEFT JOIN</button>
        <button class="btn btn-out btn-sm" onclick="runQ('subquery')">Subquery</button>
        <button class="btn btn-out btn-sm" onclick="runQ('aggregate')">Aggregate</button>
        <button class="btn btn-out btn-sm" onclick="runQ('groupby')">GROUP BY</button>
        <button class="btn btn-out btn-sm" onclick="runQ('view')">VIEW</button>
        <button class="btn btn-out btn-sm" onclick="runQ('having')">HAVING</button>
        <button class="btn btn-out btn-sm" onclick="runQ('nested')">Nested Subquery</button>
      </div>
      <textarea id="sqlBox" class="sqleditor" rows="8" style="width:100%">-- Click a query button above to load SQL\n-- Results are computed from live database</textarea>
      <div style="display:flex;gap:8px;margin-top:10px">
        <button class="btn btn-pri" onclick="execQ()">▶ Run Query</button>
        <button class="btn btn-out" onclick="document.getElementById('qres').style.display='none'">Clear Results</button>
      </div>
    </div>
  </div>
  <div id="qres" style="display:none" class="card">
    <div class="ch"><span class="ct">Query Results</span><span class="badge bg" id="qcount">0 rows</span></div>
    <div style="overflow-x:auto"><table><thead id="qrh"></thead><tbody id="qrb"></tbody></table></div>
  </div>`;

  window._queries = {
    join:{
      sql:`SELECT o.oid AS order_id,\n       c.name AS customer,\n       c.city,\n       p.name AS product,\n       p.category,\n       o.qty,\n       o.amount,\n       o.status,\n       o.date\nFROM orders o\nINNER JOIN customers c ON o.custId = c.id\nINNER JOIN products  p ON o.prodId  = p.id\nORDER BY o.date DESC;`,
      run:()=>allOrders().map(o=>({order_id:o.oid,customer:o.customerName,city:o.customerCity,product:o.productName,category:o.productCat,qty:o.qty,amount:fmt(o.amount),status:o.status,date:o.date}))
    },
    left_join:{
      sql:`SELECT c.name AS customer,\n       c.city,\n       COUNT(o.id)    AS total_orders,\n       COALESCE(SUM(o.amount), 0) AS total_spent\nFROM customers c\nLEFT JOIN orders o ON o.custId = c.id\nGROUP BY c.id, c.name, c.city\nORDER BY total_spent DESC;`,
      run:()=>DB.customers.map(cu=>({customer:cu.name,city:cu.city,total_orders:ordersByCustomer(cu.id).length,total_spent:fmt(totalSpentByCustomer(cu.id))})).sort((a,b)=>totalSpentByCustomer(DB.customers.find(x=>x.name===b.customer)?.id||0)-totalSpentByCustomer(DB.customers.find(x=>x.name===a.customer)?.id||0))
    },
    subquery:{
      sql:`SELECT c.name AS customer, c.city,\n       (SELECT COUNT(*) FROM orders o WHERE o.custId = c.id) AS total_orders,\n       (SELECT SUM(o.amount) FROM orders o WHERE o.custId = c.id) AS total_spent,\n       (SELECT MAX(o.amount) FROM orders o WHERE o.custId = c.id) AS biggest_order\nFROM customers c\nORDER BY total_spent DESC;`,
      run:()=>DB.customers.map(cu=>{const ords=ordersByCustomer(cu.id);return{customer:cu.name,city:cu.city,total_orders:ords.length,total_spent:fmt(totalSpentByCustomer(cu.id)),biggest_order:fmt(ords.reduce((m,o)=>Math.max(m,o.amount),0))}}).sort((a,b)=>totalSpentByCustomer(DB.customers.find(x=>x.name===b.customer)?.id||0)-totalSpentByCustomer(DB.customers.find(x=>x.name===a.customer)?.id||0))
    },
    aggregate:{
      sql:`SELECT p.category,\n       COUNT(o.id) AS total_orders,\n       SUM(o.qty) AS total_units,\n       SUM(o.amount) AS total_revenue,\n       AVG(o.amount) AS avg_order_value,\n       MAX(o.amount) AS max_order,\n       MIN(o.amount) AS min_order\nFROM orders o\nINNER JOIN products p ON o.prodId = p.id\nGROUP BY p.category\nORDER BY total_revenue DESC;`,
      run:()=>{const map={};DB.orders.forEach(o=>{const p=getProduct(o.prodId);if(!p)return;if(!map[p.category])map[p.category]={cat:p.category,cnt:0,units:0,rev:0,max:0,min:Infinity};const m=map[p.category];m.cnt++;m.units+=o.qty;m.rev+=o.amount;m.max=Math.max(m.max,o.amount);m.min=Math.min(m.min,o.amount)});return Object.values(map).sort((a,b)=>b.rev-a.rev).map(m=>({category:m.cat,total_orders:m.cnt,total_units:m.units,total_revenue:fmt(m.rev),avg_order_value:fmt(Math.round(m.rev/m.cnt)),max_order:fmt(m.max),min_order:fmt(m.min===Infinity?0:m.min)}))}
    },
    groupby:{
      sql:`SELECT p.name AS product, p.category, p.seller,\n       COUNT(o.id) AS orders_received,\n       SUM(o.qty) AS units_sold,\n       SUM(o.amount) AS revenue_generated\nFROM products p\nLEFT JOIN orders o ON o.prodId = p.id\nGROUP BY p.id, p.name, p.category, p.seller\nORDER BY revenue_generated DESC;`,
      run:()=>DB.products.map(p=>{const ords=DB.orders.filter(o=>o.prodId===p.id);return{product:p.name,category:p.category,seller:p.seller,orders_received:ords.length,units_sold:ords.reduce((s,o)=>s+o.qty,0),revenue_generated:fmt(ords.reduce((s,o)=>s+o.amount,0))}}).sort((a,b)=>DB.orders.filter(o=>o.prodId===DB.products.find(p=>p.name===b.product)?.id).reduce((s,o)=>s+o.amount,0)-DB.orders.filter(o=>o.prodId===DB.products.find(p=>p.name===a.product)?.id).reduce((s,o)=>s+o.amount,0))
    },
    view:{
      sql:`CREATE VIEW order_full_view AS\n  SELECT o.oid AS order_id, c.name AS customer,\n         c.city AS customer_city, p.name AS product,\n         p.category, a.name AS delivery_agent,\n         o.amount, o.status, o.date\n  FROM orders o\n  JOIN customers c ON o.custId = c.id\n  JOIN products  p ON o.prodId = p.id\n  LEFT JOIN agents a ON o.agentId = a.id;\n\nSELECT * FROM order_full_view\nWHERE status != 'Cancelled'\nORDER BY date DESC;`,
      run:()=>allOrders().filter(o=>o.status!=='Cancelled').map(o=>({order_id:o.oid,customer:o.customerName,customer_city:o.customerCity,product:o.productName,category:o.productCat,delivery_agent:o.agentName,amount:fmt(o.amount),status:o.status,date:o.date}))
    },
    having:{
      sql:`SELECT p.category,\n       COUNT(o.id) AS total_orders,\n       SUM(o.amount) AS total_revenue\nFROM orders o\nINNER JOIN products p ON o.prodId = p.id\nGROUP BY p.category\nHAVING SUM(o.amount) > 5000\nORDER BY total_revenue DESC;`,
      run:()=>{const map={};DB.orders.forEach(o=>{const p=getProduct(o.prodId);if(!p)return;if(!map[p.category])map[p.category]={cat:p.category,cnt:0,rev:0};map[p.category].cnt++;map[p.category].rev+=o.amount});return Object.values(map).filter(m=>m.rev>5000).sort((a,b)=>b.rev-a.rev).map(m=>({category:m.cat,total_orders:m.cnt,total_revenue:fmt(m.rev)}))}
    },
    nested:{
      sql:`SELECT c.name AS customer, c.city,\n       (SELECT SUM(amount) FROM orders WHERE custId = c.id) AS total_spent\nFROM customers c\nWHERE (\n  SELECT SUM(amount) FROM orders WHERE custId = c.id\n) > (\n  SELECT AVG(cust_total) FROM (\n    SELECT SUM(amount) AS cust_total FROM orders GROUP BY custId\n  ) AS sub\n)\nORDER BY total_spent DESC;`,
      run:()=>{const totals=DB.customers.map(cu=>totalSpentByCustomer(cu.id)).filter(v=>v>0);const avg=totals.length?totals.reduce((s,v)=>s+v,0)/totals.length:0;return DB.customers.map(cu=>({name:cu.name,city:cu.city,total_spent:totalSpentByCustomer(cu.id)})).filter(cu=>cu.total_spent>avg).sort((a,b)=>b.total_spent-a.total_spent).map(cu=>({customer:cu.name,city:cu.city,total_spent:fmt(cu.total_spent)}))}
    }
  };

  window.runQ = function(type) {
    const q = window._queries[type]; if (!q) return;
    document.getElementById('sqlBox').value = q.sql;
    showQResults(q.run());
  };
  window.execQ = function() {
    const sql = document.getElementById('sqlBox').value;
    const type = Object.keys(window._queries).find(k => window._queries[k].sql === sql) || 'join';
    showQResults(window._queries[type].run());
  };
  window.showQResults = function(res) {
    if (!res || !res.length) { document.getElementById('qres').style.display='none'; showToast('No results'); return; }
    document.getElementById('qres').style.display = 'block';
    document.getElementById('qcount').textContent = res.length + ' rows';
    const keys = Object.keys(res[0]);
    document.getElementById('qrh').innerHTML = '<tr>' + keys.map(k=>`<th>${k.replace(/_/g,' ')}</th>`).join('') + '</tr>';
    document.getElementById('qrb').innerHTML = res.map(r => '<tr>' + keys.map(k=>`<td>${r[k]??''}</td>`).join('') + '</tr>').join('');
    showToast('Query executed — ' + res.length + ' rows ✅');
  };
}

// ── INVENTORY ──
function pgInventory(c) {
  if (!c) c = document.getElementById('content');
  const inS = DB.products.filter(p=>p.stock>20).length;
  const low  = DB.products.filter(p=>p.stock>0&&p.stock<=20).length;
  const out  = DB.products.filter(p=>p.stock===0).length;
  c.innerHTML = `
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:16px">
    <div class="sc" data-icon="✅"><div class="sc-lbl">In Stock</div><div class="sc-val" style="color:var(--ok)">${inS}</div></div>
    <div class="sc" data-icon="⚠️"><div class="sc-lbl">Low Stock (&lt;20)</div><div class="sc-val" style="color:var(--warn)">${low}</div></div>
    <div class="sc" data-icon="❌"><div class="sc-lbl">Out of Stock</div><div class="sc-val" style="color:var(--err)">${out}</div></div>
  </div>
  <div class="card">
    <table>
      <thead><tr><th>Product</th><th>Category</th><th>Seller</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${DB.products.map(p => {
        const st = p.stock===0?'Out of Stock':p.stock<20?'Low Stock':'In Stock';
        const bc = p.stock===0?'br':p.stock<20?'bo':'bg';
        return `<tr><td><b>${p.name}</b></td><td>${p.category}</td><td>${p.seller}</td><td>${fmt(p.price)}</td>
          <td style="font-weight:700;color:${p.stock===0?'var(--err)':p.stock<20?'var(--warn)':'var(--ok)'}">${p.stock}</td>
          <td><span class="badge ${bc}">${st}</span></td>
          <td style="display:flex;gap:4px">
            <button class="btn btn-ok btn-sm" onclick="restockItem(${p.id},50)">+50</button>
            <button class="btn btn-out btn-sm" onclick="openEditProduct(${p.id})">✏️</button>
          </td></tr>`;
      }).join('')}</tbody>
    </table>
  </div>`;
}
function restockItem(id, qty) {
  const p = DB.products.find(x => x.id === id); if (!p) return;
  p.stock += qty;
  saveDB(); showToast(p.name + ' restocked +' + qty + ' ✅'); pgInventory();
}

// ── DELIVERY ──
function pgDelivery(c) {
  if (!c) c = document.getElementById('content');
  const ao = allOrders().filter(o => o.status !== 'Cancelled');
  c.innerHTML = `
  <div class="toolbar" style="justify-content:flex-end">
    <button class="btn btn-pri" onclick="assignNextDelivery()">+ Auto-Assign Delivery</button>
  </div>
  <div class="card">
    <table>
      <thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Address</th><th>Agent</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${ao.map(o => `<tr>
        <td><b>${o.oid}</b></td><td>${o.customerName}</td><td>${o.productName}</td>
        <td style="font-size:12px;color:var(--muted)">${o.address||'-'}</td>
        <td>${o.agentName}</td><td>${sBadge(o.status)}</td>
        <td style="display:flex;gap:4px">
          <button class="btn btn-out btn-sm"  onclick="openAssignAgent(${o.id})">👤 Assign</button>
          <button class="btn btn-warn btn-sm" onclick="advanceDelivery(${o.id})">↻ Next</button>
        </td></tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}
function openAssignAgent(ordId) {
  const o = DB.orders.find(x => x.id === ordId); if (!o) return;
  const eo = enrichOrder(o);
  openModal('Assign Agent — ' + eo.oid, `
    <p style="margin-bottom:12px;color:var(--muted)">Order: <b>${eo.productName}</b> → <b>${eo.customerName}</b></p>
    <div class="fg"><label>Select Delivery Agent</label>
      <select id="da-agent">${DB.agents.filter(a=>a.active).map(a=>`<option value="${a.id}" ${a.id===o.agentId?'selected':''}>${a.name} — ${a.zone} (${a.city})</option>`).join('')}</select>
    </div>
    <div class="fg"><label>Delivery Address</label><input id="da-addr" value="${o.address||''}"></div>
    <button class="btn btn-pri" onclick="saveAssignAgent(${ordId})">✓ Assign</button>
  `);
}
function saveAssignAgent(id) {
  const o = DB.orders.find(x => x.id === id); if (!o) return;
  o.agentId = parseInt(document.getElementById('da-agent').value);
  o.address = document.getElementById('da-addr').value.trim();
  if (o.status === 'Pending') o.status = 'Processing';
  saveDB(); closeModal(); showToast('Agent assigned ✅'); pgDelivery();
}
function advanceDelivery(id) {
  const o = DB.orders.find(x => x.id === id); if (!o) return;
  const st = ['Pending','Processing','Shipped','Delivered'];
  const i = st.indexOf(o.status);
  if (i < st.length - 1) o.status = st[i+1];
  saveDB(); showToast(o.oid + ' → ' + o.status); pgDelivery();
}
function assignNextDelivery() {
  const unassigned = DB.orders.find(o => o.status==='Pending' && (!o.agentId || o.agentId===0));
  if (!unassigned) { showToast('No unassigned pending orders'); return; }
  const agent = DB.agents.find(a => a.active);
  if (!agent) { showToast('No active agents available'); return; }
  unassigned.agentId = agent.id; unassigned.status = 'Processing';
  saveDB(); showToast(unassigned.oid + ' assigned to ' + agent.name + ' ✅'); pgDelivery();
}

// ── SETTINGS ──
function pgSettings(c) {
  if (!c) c = document.getElementById('content');
  c.innerHTML = `
  <div class="g2">
    <div class="card">
      <div class="ch"><span class="ct">My Profile</span></div>
      <div style="padding:16px">
        <div class="fg"><label>Full Name</label><input id="st-name" value="${curUser.name}"></div>
        <div class="fg"><label>Email</label><input id="st-email" value="${curUser.email}"></div>
        <div class="fg"><label>Phone</label><input id="st-phone" value="${curUser.phone||''}"></div>
        <div class="fg"><label>City</label><input id="st-city" value="${curUser.city||''}"></div>
        <div class="fg"><label>Password</label><input id="st-pass" type="password" placeholder="Leave blank to keep current"></div>
        <div class="fg"><label>Language</label>
          <select onchange="setLang(this.value==='Hindi (हिन्दी)'?'hi':'en')">
            <option ${lang==='en'?'selected':''}>English</option>
            <option ${lang==='hi'?'selected':''}>Hindi (हिन्दी)</option>
          </select>
        </div>
        <button class="btn btn-pri" onclick="saveProfile()">✓ Save Profile</button>
      </div>
    </div>
    <div>
      <div class="card" style="margin-bottom:16px">
        <div class="ch"><span class="ct">System Overview</span></div>
        <div style="padding:16px">
          <table>
            <tr><td style="color:var(--muted);padding:5px 0">Version</td><td><b>OrderFlow Pro v2.0</b></td></tr>
            <tr><td style="color:var(--muted);padding:5px 0">Total Orders</td><td><b>${DB.orders.length}</b></td></tr>
            <tr><td style="color:var(--muted);padding:5px 0">Total Products</td><td><b>${DB.products.length}</b></td></tr>
            <tr><td style="color:var(--muted);padding:5px 0">Total Customers</td><td><b>${DB.customers.length}</b></td></tr>
            <tr><td style="color:var(--muted);padding:5px 0">Delivery Agents</td><td><b>${DB.agents.length}</b></td></tr>
            <tr><td style="color:var(--muted);padding:5px 0">Total Revenue</td><td><b>${fmt(totalRevenue())}</b></td></tr>
            <tr><td style="color:var(--muted);padding:5px 0">Logged In As</td><td><b>${curUser.name} (${curUser.role})</b></td></tr>
          </table>
        </div>
      </div>
      <div class="card" style="margin-bottom:16px">
        <div class="ch"><span class="ct">Change Password</span></div>
        <div style="padding:16px">
          <div class="fg"><label>Current Password</label><input type="password" id="cp-cur" placeholder="Current password"></div>
          <div class="fg"><label>New Password</label><input type="password" id="cp-new" placeholder="New password (min 6)"></div>
          <div class="fg"><label>Confirm New</label><input type="password" id="cp-cnf" placeholder="Confirm new password"></div>
          <button class="btn btn-warn" onclick="changePassword()">🔒 Change Password</button>
        </div>
      </div>
      <div class="card">
        <div class="ch"><span class="ct">Database</span></div>
        <div style="padding:16px">
          <p style="font-size:12px;color:var(--muted);margin-bottom:10px">Reset all data back to defaults. This will clear all changes you have made.</p>
          <button class="btn btn-err" onclick="resetDB()">🔄 Reset to Default Data</button>
        </div>
      </div>
    </div>
  </div>`;
}
