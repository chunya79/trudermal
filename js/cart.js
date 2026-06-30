/* ===== TRUDERMAL NZ CART ===== */

const Cart = (() => {
  const STORAGE_KEY = 'trudermal_cart';

  function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  }

  function save(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function getItems() { return load(); }

  function addItem(product) {
    const items = load();
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      items.push({ ...product, qty: 1 });
    }
    save(items);
    renderDrawer();
    openDrawer();
    updateBadge();
  }

  function removeItem(id) {
    save(load().filter(i => i.id !== id));
    renderDrawer();
    updateBadge();
  }

  function updateQty(id, qty) {
    const items = load();
    const item = items.find(i => i.id === id);
    if (!item) return;
    if (qty < 1) { removeItem(id); return; }
    item.qty = qty;
    save(items);
    renderDrawer();
    updateBadge();
  }

  function clear() {
    localStorage.removeItem(STORAGE_KEY);
    renderDrawer();
    updateBadge();
  }

  function totalItems() {
    return load().reduce((sum, i) => sum + i.qty, 0);
  }

  function totalPrice() {
    return load().reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  function updateBadge() {
    const count = totalItems();
    document.querySelectorAll('.cart-badge').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  function openDrawer() {
    document.getElementById('cart-drawer')?.classList.add('open');
    document.getElementById('cart-overlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    document.getElementById('cart-drawer')?.classList.remove('open');
    document.getElementById('cart-overlay')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  function renderDrawer() {
    const items = load();
    const body = document.getElementById('cart-drawer-items');
    const footer = document.getElementById('cart-drawer-footer');
    if (!body) return;

    if (items.length === 0) {
      body.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty__icon">🛒</div>
          <p>Your cart is empty</p>
          <a href="/products/index.html" class="btn btn--primary" style="margin-top:16px;" onclick="Cart.closeDrawer()">Shop Now</a>
        </div>`;
      if (footer) footer.style.display = 'none';
      return;
    }

    body.innerHTML = items.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item__img">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item__info">
          <div class="cart-item__name">${item.name}</div>
          <div class="cart-item__price">NZD $${(item.price).toFixed(2)}</div>
          <div class="cart-item__controls">
            <button class="cart-qty__btn" onclick="Cart.updateQty('${item.id}', ${item.qty - 1})">−</button>
            <span class="cart-qty__num">${item.qty}</span>
            <button class="cart-qty__btn" onclick="Cart.updateQty('${item.id}', ${item.qty + 1})">+</button>
            <button class="cart-item__remove" onclick="Cart.removeItem('${item.id}')">Remove</button>
          </div>
        </div>
      </div>`).join('');

    if (footer) {
      footer.style.display = 'block';
      const total = document.getElementById('cart-total');
      if (total) total.textContent = `NZD $${totalPrice().toFixed(2)}`;
    }
  }

  function init() {
    // Inject drawer HTML if not already present
    if (!document.getElementById('cart-drawer')) {
      document.body.insertAdjacentHTML('beforeend', `
        <div id="cart-overlay" onclick="Cart.closeDrawer()"></div>
        <div id="cart-drawer">
          <div class="cart-drawer__header">
            <h3>Your Cart</h3>
            <button class="cart-drawer__close" onclick="Cart.closeDrawer()">✕</button>
          </div>
          <div id="cart-drawer-items" class="cart-drawer__items"></div>
          <div id="cart-drawer-footer" class="cart-drawer__footer">
            <div class="cart-drawer__total">
              <span>Total</span>
              <span id="cart-total">NZD $0.00</span>
            </div>
            <p class="cart-drawer__note">Shipping &amp; taxes calculated at checkout</p>
            <button class="btn btn--primary btn--lg" style="width:100%;" onclick="Checkout.begin()">Checkout</button>
          </div>
        </div>`);
    }

    renderDrawer();
    updateBadge();

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  return { addItem, removeItem, updateQty, clear, getItems, totalItems, totalPrice, openDrawer, closeDrawer, renderDrawer, updateBadge, init };
})();

document.addEventListener('DOMContentLoaded', () => Cart.init());

/* ===== SITE SEARCH (wires the nav search icon on every page) ===== */
(() => {
  const PRODUCTS = [
    { name: 'Trudermal Halo LED Hair Growth Cap', url: '/products/halo.html', price: 'NZD $799', kw: 'hair growth cap halo scalp loss thinning shedding 660nm red light' },
    { name: 'Trudermal Glow LED Face Mask', url: '/products/glow.html', price: 'NZD $689', kw: 'face mask glow acne wrinkles fine lines led blue red near infrared wavelength' },
    { name: 'LED Neck & Décolletage Mask', url: '/products/neck.html', price: 'NZD $689', kw: 'neck decolletage chest crepey firming 1072nm anti ageing aging' },
    { name: 'Microneedling Infusion Kit', url: '/products/microneedling.html', price: 'from NZD $174', kw: 'microneedling micro infusion serum 24k gold stamp collagen peptide' },
    { name: 'Trudermal Pro LED Device', url: '/products/pro.html', price: 'NZD $4,999', kw: 'pro professional clinic full body device panel' },
    { name: 'Bundles — Save 20%', url: '/products/bundles.html', price: 'from NZD $727', kw: 'bundle bundles save set glow grow combo deal' }
  ];

  function build() {
    if (document.getElementById('site-search')) return;
    const el = document.createElement('div');
    el.id = 'site-search';
    el.style.cssText = 'display:none;position:fixed;inset:0;z-index:1500;background:rgba(0,0,0,.45);';
    el.innerHTML =
      '<div style="background:#fff;max-width:640px;margin:0 auto;padding:24px 24px 28px;">' +
      '<input id="site-search-input" type="text" placeholder="Search products…" autocomplete="off" ' +
      'style="width:100%;padding:14px 16px;font-size:1rem;border:1px solid #e8e2dc;font-family:inherit;outline:none;">' +
      '<div id="site-search-results" style="margin-top:8px;max-height:60vh;overflow:auto;"></div></div>';
    document.body.appendChild(el);
    el.addEventListener('click', e => { if (e.target === el) closeSearch(); });
    document.getElementById('site-search-input').addEventListener('input', render);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });
  }
  function openSearch() {
    build();
    document.getElementById('site-search').style.display = 'block';
    const i = document.getElementById('site-search-input');
    i.value = ''; render(); i.focus();
  }
  function closeSearch() {
    const el = document.getElementById('site-search');
    if (el) el.style.display = 'none';
  }
  function render() {
    const q = (document.getElementById('site-search-input').value || '').toLowerCase().trim();
    const list = q ? PRODUCTS.filter(p => (p.name + ' ' + p.kw).toLowerCase().includes(q)) : PRODUCTS;
    const box = document.getElementById('site-search-results');
    box.innerHTML = list.length
      ? list.map(p => `<a href="${p.url}" style="display:flex;justify-content:space-between;gap:16px;padding:14px 8px;border-bottom:1px solid #f0ece7;color:#2c2c2c;text-decoration:none;"><span>${p.name}</span><span style="color:#626262;white-space:nowrap;">${p.price}</span></a>`).join('')
      : `<p style="padding:16px 8px;color:#626262;">No products match "${q}".</p>`;
  }
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav__search').forEach(b => b.addEventListener('click', openSearch));
  });
})();
