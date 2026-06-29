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
