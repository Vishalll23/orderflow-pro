// ═══════════════════════════════════════════════
// js/chatbot.js — AI Assistant
// Extend aiReply() to add more commands.
// ═══════════════════════════════════════════════

function toggleChat() {
  document.getElementById('cwin').classList.toggle('open');
}

function sendMsg() {
  const inp  = document.getElementById('cin');
  const msg  = inp.value.trim();
  if (!msg) return;
  const body = document.getElementById('cbody');
  body.innerHTML += `<div class="cm cme">${msg}</div>`;
  inp.value = '';
  body.innerHTML += `<div class="cm cai" id="ait">...</div>`;
  body.scrollTop = body.scrollHeight;
  setTimeout(() => {
    const t = document.getElementById('ait');
    if (t) t.outerHTML = `<div class="cm cai">${aiReply(msg)}</div>`;
    body.scrollTop = body.scrollHeight;
  }, 700);
}

// ── Add more keyword responses here ──
function aiReply(msg) {
  const m = msg.toLowerCase();
  if (m.includes('नमस्ते') || m.includes('hello') || m.includes('hi'))
    return lang==='hi' ? 'नमस्ते! मैं OrderFlow AI हूँ 🙏 कैसे मदद करूँ?' : "Hello! I'm OrderFlow AI 🙏 How can I help you?";
  if (m.includes('order') || m.includes('ऑर्डर'))
    return `${DB.orders.length} total orders. Pending: ${DB.orders.filter(o=>o.status==='Pending').length}, Delivered: ${DB.orders.filter(o=>o.status==='Delivered').length}. Revenue: ${fmt(totalRevenue())} 📦`;
  if (m.includes('product') || m.includes('उत्पाद'))
    return `${DB.products.length} products. Out of stock: ${DB.products.filter(p=>p.stock===0).length}, Low stock: ${DB.products.filter(p=>p.stock>0&&p.stock<20).length} 🏪`;
  if (m.includes('customer') || m.includes('ग्राहक'))
    return `${DB.customers.length} customers. Top spender: ${[...DB.customers].sort((a,b)=>totalSpentByCustomer(b.id)-totalSpentByCustomer(a.id))[0]?.name} 👥`;
  if (m.includes('agent') || m.includes('delivery') || m.includes('डिलीवरी'))
    return `${DB.agents.length} agents. Active: ${DB.agents.filter(a=>a.active).length}, Inactive: ${DB.agents.filter(a=>!a.active).length} 🚴`;
  if (m.includes('revenue') || m.includes('sales') || m.includes('राजस्व'))
    return `Total revenue: ${fmt(totalRevenue())}. Delivered orders: ${fmt(DB.orders.filter(o=>o.status==='Delivered').reduce((s,o)=>s+o.amount,0))} 💰`;
  if (m.includes('sql') || m.includes('query') || m.includes('join'))
    return 'Go to SQL Reports! Supports INNER JOIN, LEFT JOIN, Subquery, Aggregate, GROUP BY, HAVING, VIEW, Nested Subquery — all run on live data! 🗃️';
  if (m.includes('stock') || m.includes('inventory'))
    return `In stock: ${DB.products.filter(p=>p.stock>20).length}, Low: ${DB.products.filter(p=>p.stock>0&&p.stock<20).length}, Out: ${DB.products.filter(p=>p.stock===0).length} 📋`;
  if (m.includes('hindi') || m.includes('हिंदी'))
    return 'Sidebar के नीचे EN/हिं button से language switch करें! 🇮🇳';
  if (m.includes('reset') || m.includes('clear data'))
    return 'To reset all data to defaults, go to Settings → Reset Database. ⚠️';
  if (m.includes('help') || m.includes('मदद'))
    return `Ask about: orders, products, customers, agents, revenue, delivery, inventory, SQL. Logged in as ${curUser?.name} (${curUser?.role}) 🤖`;
  if (m.includes('top product') || m.includes('best'))
    return `Top product: ${topProductsBySales()[0]?.name} (${topProductsBySales()[0]?.sold} units). Revenue: ${fmt(topProductsBySales()[0]?.price * topProductsBySales()[0]?.sold)} 🏆`;
  return `You asked: "${msg}". I can help with orders, products, customers, agents, revenue, delivery, inventory, or SQL queries! 🤖`;
}
