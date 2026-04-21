# 🛒 OrderFlow Pro v2

A full-featured **E-Commerce Management System** built with vanilla HTML, CSS and JavaScript — no frameworks, no dependencies, runs entirely in the browser.

Built for **hackathons** and rapid prototyping.

---

## 🚀 Features

| Feature | Details |
|---|---|
| 🔐 Auth | Login / Signup with role-based access |
| 👑 Admin | Full dashboard, orders, products, customers, agents |
| 🛍 Customer | Place orders, track shipments |
| 🏪 Seller | Manage products, view revenue |
| 🚴 Delivery Agent | Track & update delivery status |
| 📊 Analytics | Revenue charts, top products, customer leaderboard |
| 🗃 SQL Reports | 8 live SQL query types (JOIN, GROUP BY, HAVING, etc.) |
| 📦 Inventory | Stock alerts, restock actions |
| 🤖 AI Chatbot | Built-in assistant for quick stats |
| 🌐 Bilingual | English + Hindi (हिन्दी) |
| 💾 Persistence | LocalStorage — data survives page refresh |

---

## 📁 Project Structure

```
orderflow/
├── index.html          ← Main entry point (shell + auth UI)
├── README.md
├── css/
│   └── style.css       ← All styles
├── js/
│   ├── db.js           ← Data store + seed data (edit this to change demo data)
│   ├── auth.js         ← Login, signup, logout
│   ├── nav.js          ← Sidebar navigation + routing
│   ├── helpers.js      ← Utility functions (fmt, toast, modal, etc.)
│   └── chatbot.js      ← AI assistant logic
└── pages/
    ├── admin.js        ← Admin dashboard, orders, products, customers, agents
    ├── analytics.js    ← Charts, SQL reports, inventory, delivery
    └── user.js         ← Customer, seller, delivery agent pages
```

---

## 🏃 How to Run

**Option 1 — Just open the file:**
```
Double-click index.html in your file explorer
```

**Option 2 — Local server (recommended):**
```bash
# Python
python -m http.server 8080

# Node
npx serve .
```
Then open `http://localhost:8080`

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@orderflow.com | admin123 |
| Customer | customer@orderflow.com | cust123 |
| Seller | seller@orderflow.com | sell123 |
| Delivery | delivery@orderflow.com | del123 |

---

## ✏️ How to Customize

- **Change demo data** → edit `js/db.js` (products, users, orders)
- **Add a new page** → add a function in the right `pages/*.js` file, register it in `nav.js`
- **Change colors** → edit CSS variables at the top of `css/style.css`
- **Add a language** → extend the `T` object in `js/nav.js`

---

## 📤 Deploying

Works on any static host:
- **GitHub Pages** → push to repo → Settings → Pages → Deploy from branch `main`
- **Netlify** → drag & drop the folder
- **Vercel** → `vercel deploy`

---

## 🏆 Hackathon Tips

- Data resets on page refresh by default — enable localStorage in `js/db.js` for persistence
- All pages are in `pages/` — easy to add new features quickly
- SQL Reports page is great to showcase for judges

---

*Made with ❤️ — OrderFlow Pro v2*
