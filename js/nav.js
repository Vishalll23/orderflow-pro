// ═══════════════════════════════════════════════
// js/nav.js — Sidebar Navigation & Page Routing
// To add a new page:
//   1. Add an entry to NAV[role] below
//   2. Add a PMETA entry
//   3. Add it to the R{} router in goto()
//   4. Create the function in pages/*.js
// ═══════════════════════════════════════════════

// ── Sidebar nav config per role ──
const NAV = {
  admin: [
    {sec:'main',     items:[{id:'dashboard',icon:'📊'}, {id:'orders',icon:'📦',badge:()=>DB.orders.filter(o=>o.status==='Pending').length}, {id:'products',icon:'🏪'}, {id:'customers',icon:'👥'}, {id:'agents',icon:'🚴'}]},
    {sec:'analytics',items:[{id:'analytics',icon:'📈'}, {id:'reports',icon:'🗂'}]},
    {sec:'management',items:[{id:'inventory',icon:'📋'}, {id:'delivery',icon:'🚚'}, {id:'settings',icon:'⚙️'}]},
  ],
  customer: [
    {sec:'main',   items:[{id:'cust-dash',icon:'📊'}, {id:'place-order',icon:'🛍'}, {id:'my-orders',icon:'📦'}]},
    {sec:'account',items:[{id:'cust-profile',icon:'👤'}]},
  ],
  seller: [
    {sec:'main',    items:[{id:'sell-dash',icon:'📊'}, {id:'manage-products',icon:'🏪'}, {id:'sell-orders',icon:'📦'}]},
    {sec:'analytics',items:[{id:'sell-analytics',icon:'📈'}, {id:'inventory',icon:'📋'}]},
    {sec:'account', items:[{id:'sell-profile',icon:'⚙️'}]},
  ],
  delivery: [
    {sec:'main',   items:[{id:'del-dash',icon:'📊'}, {id:'my-deliveries',icon:'🚚'}]},
    {sec:'account',items:[{id:'del-profile',icon:'👤'}]},
  ],
};

// ── Page metadata (icon + translation key) ──
const PMETA = {
  dashboard:{icon:'📊',label:'dashboard'}, orders:{icon:'📦',label:'orders'}, products:{icon:'🏪',label:'products'},
  customers:{icon:'👥',label:'customers'}, agents:{icon:'🚴',label:'agents'}, analytics:{icon:'📈',label:'analytics'},
  reports:{icon:'🗂',label:'reports'}, inventory:{icon:'📋',label:'inventory'}, delivery:{icon:'🚚',label:'delivery'},
  settings:{icon:'⚙️',label:'settings'},
  'cust-dash':{icon:'📊',label:'dashboard'}, 'place-order':{icon:'🛍',label:'place-order'},
  'my-orders':{icon:'📦',label:'my-orders'}, 'cust-profile':{icon:'👤',label:'profile'},
  'sell-dash':{icon:'📊',label:'dashboard'}, 'manage-products':{icon:'🏪',label:'manage-products'},
  'sell-orders':{icon:'📦',label:'orders'},  'sell-analytics':{icon:'📈',label:'analytics'},
  'sell-profile':{icon:'⚙️',label:'settings'},
  'del-dash':{icon:'📊',label:'dashboard'}, 'my-deliveries':{icon:'🚚',label:'my-deliveries'},
  'del-profile':{icon:'👤',label:'profile'},
};

// ── Translations ──
const T = {
  en: {tagline:'E-Commerce System', logout:'Logout', dashboard:'Dashboard', orders:'Orders', products:'Products',
       customers:'Customers', agents:'Delivery Agents', analytics:'Sales Analytics', reports:'SQL Reports',
       inventory:'Inventory', delivery:'Delivery', settings:'Settings',
       'my-orders':'My Orders', 'place-order':'Place Order', 'manage-products':'My Products',
       'my-deliveries':'My Deliveries', profile:'Profile',
       'ai-greet':"Hello! I'm OrderFlow AI. Ask me about orders, products, customers, analytics or SQL! 👋"},
  hi: {tagline:'ई-कॉमर्स प्रणाली', logout:'लॉगआउट', dashboard:'डैशबोर्ड', orders:'ऑर्डर', products:'उत्पाद',
       customers:'ग्राहक', agents:'डिलीवरी एजेंट', analytics:'बिक्री विश्लेषण', reports:'SQL रिपोर्ट',
       inventory:'इन्वेंटरी', delivery:'डिलीवरी', settings:'सेटिंग्स',
       'my-orders':'मेरे ऑर्डर', 'place-order':'ऑर्डर दें', 'manage-products':'मेरे उत्पाद',
       'my-deliveries':'मेरी डिलीवरी', profile:'प्रोफ़ाइल',
       'ai-greet':'नमस्ते! मैं OrderFlow AI हूँ। ऑर्डर, उत्पाद, ग्राहक के बारे में पूछें! 👋'},
};

function t(k) { return (T[lang] && T[lang][k]) || k; }

// ── Language switcher ──
function setLang(l) {
  lang = l;
  ['sEN','alEN'].forEach(id => { const e=document.getElementById(id); if(e) e.classList.toggle('on', l==='en'); });
  ['sHI','alHI'].forEach(id => { const e=document.getElementById(id); if(e) e.classList.toggle('on', l==='hi'); });
  const tmap = {'s-tagline':'tagline','s-logout':'logout','ab-sub':'tagline','cgreet':'ai-greet',
                'cstatus': l==='hi' ? 'ऑनलाइन · कुछ भी पूछें' : 'Online · Ask me anything'};
  for (let id in tmap) {
    const e = document.getElementById(id);
    if (e) e.textContent = typeof tmap[id]==='string' && tmap[id].length>20 ? tmap[id] : t(tmap[id]);
  }
  if (curUser) renderNav();
}

// ── Build sidebar HTML and inject it ──
function renderNav() {
  const cfg = NAV[curUser.role] || NAV.admin;
  const sl  = {main:lang==='hi'?'मुख्य':'Main', analytics:lang==='hi'?'विश्लेषण':'Analytics',
               management:lang==='hi'?'प्रबंधन':'Management', account:lang==='hi'?'खाता':'Account'};
  let h = '';
  cfg.forEach(s => {
    h += `<div class="nsec">${sl[s.sec] || s.sec}</div>`;
    s.items.forEach(item => {
      const cnt = item.badge ? item.badge() : 0;
      h += `<div class="ni ${curPage===item.id?'on':''}" onclick="goto('${item.id}')">
              <span class="ic">${item.icon}</span>
              <span>${t(item.id) || t(item.label) || item.id}</span>
              ${cnt > 0 ? `<span class="nbadge">${cnt}</span>` : ''}
            </div>`;
    });
  });
  document.getElementById('snav').innerHTML = h;
  if (!curPage) goto(cfg[0].items[0].id);
}

// ── Page router — maps page IDs to render functions ──
function goto(pid) {
  curPage = pid;
  const m = PMETA[pid] || {icon:'📄', label:pid};
  document.getElementById('pgIcon').textContent  = m.icon;
  document.getElementById('pgTitle').textContent = t(m.label) || pid;
  renderNav();

  const c = document.getElementById('content');
  c.innerHTML = '';

  // Add a new page here ↓
  const R = {
    // Admin
    dashboard:        pgAdminDash,
    orders:           pgOrders,
    products:         pgProducts,
    customers:        pgCustomers,
    agents:           pgAgents,
    analytics:        pgAnalytics,
    reports:          pgReports,
    inventory:        pgInventory,
    delivery:         pgDelivery,
    settings:         pgSettings,
    // Customer
    'cust-dash':      pgCustDash,
    'place-order':    pgPlaceOrder,
    'my-orders':      pgMyOrders,
    'cust-profile':   pgSettings,
    // Seller
    'sell-dash':      pgSellDash,
    'manage-products':pgManageProducts,
    'sell-orders':    pgOrders,
    'sell-analytics': pgAnalytics,
    'sell-profile':   pgSettings,
    // Delivery
    'del-dash':       pgDelDash,
    'my-deliveries':  pgDelivery,
    'del-profile':    pgSettings,
  };

  if (R[pid]) R[pid](c);
  else c.innerHTML = `<div style="padding:40px;text-align:center;color:var(--muted)">🚧 Page coming soon</div>`;
}
