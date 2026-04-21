// ═══════════════════════════════════════════════
// js/db.js — Central Data Store
// Edit this file to change demo data, add products,
// users, or orders. All other files read from DB.
// ═══════════════════════════════════════════════

// ── Global state ──
let lang = 'en';
let curUser = null;
let curPage = '';

// ── Seed data (loaded once on first visit) ──
const SEED = {
  users: [
    {id:1, email:'admin@orderflow.com',    pass:'admin123',  name:'Anjali Admin',   role:'admin',    phone:'9000000001', city:'Delhi'},
    {id:2, email:'customer@orderflow.com', pass:'cust123',   name:'Rahul Sharma',   role:'customer', phone:'9876543210', city:'Mumbai'},
    {id:3, email:'seller@orderflow.com',   pass:'sell123',   name:'Priya Seller',   role:'seller',   phone:'9876543211', city:'Bangalore', shop:'TechWorld Store'},
    {id:4, email:'delivery@orderflow.com', pass:'del123',    name:'Suresh Kumar',   role:'delivery', phone:'9876543212', city:'Pune'},
  ],
  products: [
    {id:1, name:'Laptop Pro X',        category:'Electronics', price:65000, stock:45,  seller:'TechWorld Store', sellerId:3, rating:4.8, sold:48,  desc:'High performance laptop'},
    {id:2, name:'Wireless Headphones', category:'Electronics', price:4500,  stock:120, seller:'TechWorld Store', sellerId:3, rating:4.5, sold:134, desc:'Noise cancelling'},
    {id:3, name:'Smart Watch',         category:'Electronics', price:18000, stock:8,   seller:'TechWorld Store', sellerId:3, rating:4.3, sold:62,  desc:'Fitness tracker'},
    {id:4, name:'Running Shoes',       category:'Sports',      price:3200,  stock:200, seller:'SportZone',       sellerId:10,rating:4.7, sold:210, desc:'Lightweight'},
    {id:5, name:'Backpack',            category:'Sports',      price:2100,  stock:0,   seller:'SportZone',       sellerId:10,rating:4.2, sold:89,  desc:'Waterproof 30L'},
    {id:6, name:'Cotton Kurta',        category:'Clothing',    price:899,   stock:15,  seller:'FashionHub',      sellerId:11,rating:4.1, sold:320, desc:'Premium cotton'},
    {id:7, name:'Study Table',         category:'Home',        price:6500,  stock:30,  seller:'HomeDecor',       sellerId:12,rating:4.4, sold:41,  desc:'Ergonomic design'},
  ],
  customers: [
    {id:1, name:'Rahul Sharma',  email:'rahul@email.com',  phone:'9876543210', city:'Mumbai',    status:'Active'},
    {id:2, name:'Amit Kumar',    email:'amit@email.com',   phone:'9876543211', city:'Bangalore', status:'Active'},
    {id:3, name:'Neha Gupta',    email:'neha@email.com',   phone:'9876543212', city:'Pune',      status:'Active'},
    {id:4, name:'Vikram Patel',  email:'vikram@email.com', phone:'9876543213', city:'Ahmedabad', status:'Active'},
    {id:5, name:'Kavita Singh',  email:'kavita@email.com', phone:'9876543214', city:'Jaipur',    status:'Active'},
    {id:6, name:'Deepak Raj',    email:'deepak@email.com', phone:'9876543215', city:'Chennai',   status:'Active'},
  ],
  agents: [
    {id:1, name:'Suresh Kumar',   phone:'9000000010', city:'Pune',    zone:'West',  active:true},
    {id:2, name:'Mohan Lal',      phone:'9000000011', city:'Delhi',   zone:'North', active:true},
    {id:3, name:'Raju Singh',     phone:'9000000012', city:'Mumbai',  zone:'West',  active:true},
    {id:4, name:'Pradeep Yadav',  phone:'9000000013', city:'Chennai', zone:'South', active:false},
  ],
  orders: [
    {id:1, oid:'ORD-001', custId:1, prodId:1, qty:1, amount:65000, status:'Delivered',  payment:'Credit Card', date:'2024-06-01', agentId:1, address:'12 Marine Lines, Mumbai'},
    {id:2, oid:'ORD-002', custId:1, prodId:2, qty:1, amount:4500,  status:'Shipped',    payment:'UPI',         date:'2024-06-03', agentId:2, address:'12 Marine Lines, Mumbai'},
    {id:3, oid:'ORD-003', custId:2, prodId:3, qty:1, amount:18000, status:'Processing', payment:'Net Banking',  date:'2024-06-05', agentId:0, address:'56 MG Road, Bangalore'},
    {id:4, oid:'ORD-004', custId:3, prodId:4, qty:2, amount:6400,  status:'Pending',    payment:'COD',         date:'2024-06-06', agentId:0, address:'8 FC Road, Pune'},
    {id:5, oid:'ORD-005', custId:4, prodId:5, qty:1, amount:2100,  status:'Delivered',  payment:'UPI',         date:'2024-06-07', agentId:1, address:'45 SG Highway, Ahmedabad'},
    {id:6, oid:'ORD-006', custId:1, prodId:1, qty:1, amount:65000, status:'Pending',    payment:'COD',         date:'2024-06-08', agentId:0, address:'12 Marine Lines, Mumbai'},
    {id:7, oid:'ORD-007', custId:5, prodId:6, qty:2, amount:1798,  status:'Shipped',    payment:'UPI',         date:'2024-06-09', agentId:1, address:'9 MI Road, Jaipur'},
    {id:8, oid:'ORD-008', custId:6, prodId:7, qty:1, amount:6500,  status:'Delivered',  payment:'Credit Card', date:'2024-06-10', agentId:2, address:'22 Anna Salai, Chennai'},
  ],
  _nextProdId:8, _nextCustId:7, _nextOrderId:9, _nextAgentId:5, _nextUserId:5,
};

// ── Load DB from localStorage (persist across refreshes) ──
function loadDB() {
  try {
    const saved = localStorage.getItem('orderflow_db');
    if (saved) return JSON.parse(saved);
  } catch(e) {}
  return JSON.parse(JSON.stringify(SEED)); // fresh copy of seed
}

// ── Save DB to localStorage ──
function saveDB() {
  try { localStorage.setItem('orderflow_db', JSON.stringify(DB)); } catch(e) {}
}

// ── The live DB object ──
const DB = loadDB();

// Auto-save whenever DB is mutated (every 2 seconds)
setInterval(saveDB, 2000);

// ── Reset DB to seed data (admin can trigger this) ──
function resetDB() {
  if (!confirm('Reset ALL data to defaults? This cannot be undone.')) return;
  localStorage.removeItem('orderflow_db');
  location.reload();
}

// ═══════════════════════════════════════════════
// Query helpers — use these instead of touching DB directly
// ═══════════════════════════════════════════════
function getProduct(id)  { return DB.products.find(p => p.id == id); }
function getCustomer(id) { return DB.customers.find(c => c.id == id); }
function getAgent(id)    { return DB.agents.find(a => a.id == id); }
function getUser(id)     { return DB.users.find(u => u.id == id); }

function enrichOrder(o) {
  const p = getProduct(o.prodId)  || {name:'Unknown', category:'?', price:0};
  const c = getCustomer(o.custId) || {name:'Unknown', city:'-'};
  const a = getAgent(o.agentId)   || {name:'Unassigned'};
  return {...o, productName:p.name, productCat:p.category, productPrice:p.price,
                customerName:c.name, customerCity:c.city, agentName:a.name};
}

function allOrders()    { return DB.orders.map(enrichOrder); }
function totalRevenue() { return DB.orders.reduce((s,o) => s + o.amount, 0); }
function ordersByCustomer(custId) { return DB.orders.filter(o => o.custId == custId); }
function totalSpentByCustomer(custId) { return ordersByCustomer(custId).reduce((s,o) => s + o.amount, 0); }

function revenueByCategory() {
  const map = {};
  DB.orders.forEach(o => {
    const p = getProduct(o.prodId); if (!p) return;
    map[p.category] = (map[p.category] || 0) + o.amount;
  });
  return Object.entries(map).map(([cat,rev]) => ({cat,rev})).sort((a,b) => b.rev - a.rev);
}

function topProductsBySales() {
  return DB.products.slice().sort((a,b) => b.sold - a.sold);
}

// ── Select option helpers ──
function prodOpts(filterInStock) {
  const list = filterInStock ? DB.products.filter(p => p.stock > 0) : DB.products;
  return list.map(p => `<option value="${p.id}">${p.name} — ${fmt(p.price)} (stock:${p.stock})</option>`).join('');
}
function custOpts()  { return DB.customers.map(c => `<option value="${c.id}">${c.name} — ${c.city}</option>`).join(''); }
function agentOpts() { return [`<option value="0">Unassigned</option>`, ...DB.agents.map(a => `<option value="${a.id}">${a.name} — ${a.zone}</option>`)].join(''); }
