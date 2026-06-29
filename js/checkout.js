/* ===== TRUDERMAL NZ CHECKOUT ===== */

const Checkout = (() => {
  async function begin() {
    const items = Cart.getItems();
    if (!items.length) return;

    const btn = document.querySelector('#cart-drawer-footer .btn');
    if (btn) { btn.textContent = 'Processing...'; btn.disabled = true; }

    try {
      const res = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });

      if (!res.ok) throw new Error('Checkout failed');
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      alert('Something went wrong. Please try again.');
      if (btn) { btn.textContent = 'Checkout'; btn.disabled = false; }
    }
  }

  return { begin };
})();
