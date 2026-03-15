/* ─── App.js — RITB Shared JS ─── */

const API = 'http://localhost:5000';
const SERVER = 'http://localhost:5000';

// ─── If opened via file://, redirect to the Flask server immediately ───
(function () {
  if (window.location.protocol === 'file:') {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    window.location.replace(SERVER + '/' + path + window.location.search);
  }
})();

// ─── Navigate helper: always use the server origin ───
function goTo(page) {
  window.location.href = SERVER + '/' + page;
}

// ─── Toast Notifications ───
function showToast(message, type = 'default', duration = 3500) {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = message;
  document.body.appendChild(t);
  setTimeout(() => { t.style.animation = 'none'; t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, duration);
}

// ─── Auth State ───
let currentUser = null;

async function loadAuthState() {
  try {
    const r = await fetch(`${API}/api/auth/me`, { credentials: 'include' });
    if (r.ok) { currentUser = await r.json(); }
    else { currentUser = null; }
  } catch { currentUser = null; }
  renderNavAuth();
}

function renderNavAuth() {
  const actions = document.getElementById('nav-actions');
  if (!actions) return;
  if (currentUser) {
    const role = currentUser.role;
    const dashLink = role === 'admin' ? 'admin.html' : role === 'teacher' ? 'teacher-dashboard.html' : null;
    actions.innerHTML = `
      ${dashLink ? `<a href="${dashLink}" class="btn btn-secondary btn-sm btn-pill" style="font-weight:700">${role === 'admin' ? '⚙ Admin' : '📊 Dashboard'}</a>` : ''}
      <a href="${dashLink || 'index.html'}" class="user-chip">
        <span class="material-symbols-rounded" style="font-size:1.1rem">account_circle</span>
        ${currentUser.name.split(' ')[0]}
      </a>
      <button class="btn btn-secondary btn-sm btn-pill" onclick="logout()">Sign Out</button>`;
  } else {
    actions.innerHTML = `<a href="login.html" class="btn-nav-login">Sign In</a>`;
  }
}

async function logout() {
  await fetch(`${API}/api/auth/logout`, { method: 'POST', credentials: 'include' });
  currentUser = null;
  renderNavAuth();
  showToast('Signed out successfully');
  setTimeout(() => goTo('index.html'), 800);
}

// ─── API Helpers ───
async function apiFetch(url, options = {}) {
  const defaults = { credentials: 'include', headers: { 'Content-Type': 'application/json' } };
  const response = await fetch(`${API}${url}`, { ...defaults, ...options, headers: { ...defaults.headers, ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
}

// ─── Format Helpers ───
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) {
    const hours = Math.floor(diff / 3600000);
    if (hours === 0) return 'Just now';
    return `${hours}h ago`;
  }
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return formatDate(dateStr);
}

function getCategoryColor(cat) {
  const map = {
    'Academic': 'chip-primary', 'Academics': 'chip-primary',
    'Athletics': 'chip-tertiary', 'Sports': 'chip-tertiary',
    'Research': 'chip-secondary', 'Social': 'chip-warning',
    'Career': 'chip-success', 'Arts': 'chip-tertiary',
    'General': 'chip-primary'
  };
  return map[cat] || 'chip-primary';
}

// ─── Image Fallback ───
function imgFallback(img, type = 'news') {
  const fallbacks = {
    news: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
    event: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    faculty: 'https://i.pravatar.cc/300?img=1'
  };
  img.src = fallbacks[type] || fallbacks.news;
  img.onerror = null;
}

// ─── Active Nav Link ───
function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
  });
}

// ─── Mobile Menu Toggle ───
function toggleMenu() {
  const links = document.getElementById('nav-links');
  if (links) links.classList.toggle('active');
}

// ─── Init on Page Load ───
document.addEventListener('DOMContentLoaded', () => {
  loadAuthState();
  setActiveNav();
});
