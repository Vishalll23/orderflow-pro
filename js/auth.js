// ═══════════════════════════════════════════════
// js/auth.js — Authentication
// Handles login, signup and logout.
// To add OAuth or a real backend, replace doLogin()
// and doSignup() with API calls here.
// ═══════════════════════════════════════════════

// Switch between Login and Sign Up tabs
function authTab(tab) {
  document.getElementById('loginForm').style.display  = tab === 'login'  ? 'block' : 'none';
  document.getElementById('signupForm').style.display = tab === 'signup' ? 'block' : 'none';
  document.getElementById('atL').classList.toggle('on', tab === 'login');
  document.getElementById('atS').classList.toggle('on', tab === 'signup');
}

// Login with email + password
function doLogin() {
  const email = document.getElementById('lE').value.trim();
  const pass  = document.getElementById('lP').value.trim();
  if (!email || !pass) { showToast('Please enter email and password ❌'); return; }
  const u = DB.users.find(x => x.email === email && x.pass === pass);
  if (!u) { showToast(lang === 'hi' ? 'गलत ईमेल या पासवर्ड ❌' : 'Invalid email or password ❌'); return; }
  loginSuccess(u);
}

// Quick demo login — fills credentials, user must click Login
function qLogin(role) {
  const emails = {admin:'admin@orderflow.com', customer:'customer@orderflow.com', seller:'seller@orderflow.com', delivery:'delivery@orderflow.com'};
  const passes = {admin:'admin123', customer:'cust123', seller:'sell123', delivery:'del123'};
  document.getElementById('lE').value = emails[role];
  document.getElementById('lP').value = passes[role];
  document.getElementById('lP').focus();
  showToast('Demo credentials filled. Click Login to continue.');
}

// Sign up a new account
function doSignup() {
  const fn    = document.getElementById('sfn').value.trim();
  const ln    = document.getElementById('sln').value.trim();
  const email = document.getElementById('se').value.trim();
  const role  = document.getElementById('sr').value;
  const pass  = document.getElementById('sp').value.trim();
  const phone = document.getElementById('sph').value.trim();
  const city  = document.getElementById('sci').value.trim();

  if (!fn || !email || pass.length < 6) { showToast('Fill all fields (password min 6 chars)'); return; }
  if (DB.users.find(u => u.email === email)) { showToast('Email already registered'); return; }

  const newU = {id:DB._nextUserId++, email, pass, name:fn+' '+ln, role, phone, city};
  DB.users.push(newU);

  if (role === 'customer') DB.customers.push({id:DB._nextCustId++, name:fn+' '+ln, email, phone, city, status:'Active'});
  if (role === 'delivery') DB.agents.push({id:DB._nextAgentId++, name:fn+' '+ln, phone, city, zone:'-', active:true});

  saveDB();
  showToast('Account created! ✅');
  setTimeout(() => loginSuccess(newU), 700);
}

// Called after successful login — sets up the UI
function loginSuccess(u) {
  curUser = u;
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('mainApp').style.display    = 'flex';
  document.getElementById('fab').style.display        = 'flex';

  document.getElementById('sAvt').textContent = u.name.charAt(0).toUpperCase();
  document.getElementById('sName').textContent = u.name;

  const roleLabels = {admin:'Administrator', customer:'Customer', seller:'Seller / Vendor', delivery:'Delivery Agent'};
  document.getElementById('sRole').textContent = roleLabels[u.role] || u.role;

  const roleColors = {
    admin:    'linear-gradient(135deg,#1a56db,#f97316)',
    customer: 'linear-gradient(135deg,#16a34a,#60a5fa)',
    seller:   'linear-gradient(135deg,#7c3aed,#f97316)',
    delivery: 'linear-gradient(135deg,#d97706,#dc2626)',
  };
  document.getElementById('sAvt').style.background = roleColors[u.role] || roleColors.admin;

  renderNav();
  setInterval(tick, 1000);
  tick();
  showToast('Welcome, ' + u.name + '! 👋');
}

// Logout
function logout() {
  curUser = null; curPage = '';
  document.getElementById('mainApp').style.display    = 'none';
  document.getElementById('authScreen').style.display = 'flex';
  document.getElementById('fab').style.display        = 'none';
  document.getElementById('cwin').classList.remove('open');
  document.getElementById('lE').value = '';
  document.getElementById('lP').value = '';
  showToast('Logged out successfully');
}

// Settings — save profile
function saveProfile() {
  curUser.name  = document.getElementById('st-name').value.trim();
  curUser.email = document.getElementById('st-email').value.trim();
  curUser.phone = document.getElementById('st-phone').value.trim();
  curUser.city  = document.getElementById('st-city').value.trim();
  const newPass = document.getElementById('st-pass').value.trim();
  if (newPass.length >= 6) curUser.pass = newPass;
  document.getElementById('sName').textContent = curUser.name;
  document.getElementById('sAvt').textContent  = curUser.name.charAt(0).toUpperCase();
  saveDB();
  showToast('Profile updated ✅');
}

// Settings — change password
function changePassword() {
  const cur = document.getElementById('cp-cur').value;
  const nw  = document.getElementById('cp-new').value;
  const cnf = document.getElementById('cp-cnf').value;
  if (cur !== curUser.pass)   { showToast('Current password is wrong ❌'); return; }
  if (nw.length < 6)          { showToast('New password must be 6+ chars'); return; }
  if (nw !== cnf)             { showToast('Passwords do not match ❌'); return; }
  curUser.pass = nw;
  saveDB();
  showToast('Password changed ✅');
}
