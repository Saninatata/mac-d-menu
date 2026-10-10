const tabs = document.querySelectorAll('.category-tab');
const cards = [...document.querySelectorAll('.menu-card')];
const count = document.getElementById('menuCount');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const cartCountEl = document.getElementById('cartCount');
const checkoutForm = document.getElementById('checkoutForm');
const WHATSAPP_NUMBER = '2349138414425';
const cart = new Map();
const money = value => '₦' + Number(value).toLocaleString('en-NG');

function filterMenu(category) {
  let visible = 0;
  cards.forEach(card => {
    const show = category === 'all' || card.dataset.category === category;
    card.hidden = !show;
    if (show) visible++;
  });
  count.textContent = `${visible} menu item${visible === 1 ? '' : 's'}`;
  tabs.forEach(tab => {
    const active = tab.dataset.category === category;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
}
tabs.forEach(tab => tab.addEventListener('click', () => filterMenu(tab.dataset.category)));

function renderCart() {
  if (!cart.size) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Your cart is empty. Add something delicious from the menu.</p>';
  } else {
    cartItemsEl.innerHTML = [...cart.entries()].map(([id, item]) => `
      <div class="cart-line">
        <div class="cart-line-copy"><strong>${escapeHtml(item.name)}</strong><span>${money(item.price)} each</span></div>
        <div class="quantity-control" aria-label="Quantity for ${escapeHtml(item.name)}">
          <button type="button" data-qty="${id}" data-change="-1" aria-label="Decrease ${escapeHtml(item.name)} quantity">−</button>
          <span>${item.qty}</span>
          <button type="button" data-qty="${id}" data-change="1" aria-label="Increase ${escapeHtml(item.name)} quantity">＋</button>
        </div>
        <strong class="line-total">${money(item.price * item.qty)}</strong>
        <button class="remove-item" type="button" data-remove="${id}" aria-label="Remove ${escapeHtml(item.name)}">Remove</button>
      </div>`).join('');
  }
  const quantity = [...cart.values()].reduce((sum, item) => sum + item.qty, 0);
  const total = [...cart.values()].reduce((sum, item) => sum + item.price * item.qty, 0);
  cartTotalEl.textContent = money(total);
  cartCountEl.textContent = quantity;
  document.querySelectorAll('[data-add]').forEach(button => {
    const item = cart.get(button.dataset.add);
    button.innerHTML = item ? `Added · ${item.qty} <span aria-hidden="true">✓</span>` : 'Add to cart <span aria-hidden="true">＋</span>';
    button.classList.toggle('is-added', Boolean(item));
  });
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
document.querySelectorAll('[data-add]').forEach(button => button.addEventListener('click', () => {
  const card = document.querySelector(`[data-product-id="${button.dataset.add}"]`);
  const id = card.dataset.productId;
  const existing = cart.get(id);
  cart.set(id, { name: card.dataset.name, price: Number(card.dataset.price), qty: existing ? existing.qty + 1 : 1 });
  renderCart();
}));
cartItemsEl.addEventListener('click', event => {
  const qtyButton = event.target.closest('[data-qty]');
  const removeButton = event.target.closest('[data-remove]');
  if (qtyButton) {
    const item = cart.get(qtyButton.dataset.qty);
    if (!item) return;
    item.qty += Number(qtyButton.dataset.change);
    if (item.qty <= 0) cart.delete(qtyButton.dataset.qty); else cart.set(qtyButton.dataset.qty, item);
    renderCart();
  }
  if (removeButton) { cart.delete(removeButton.dataset.remove); renderCart(); }
});
checkoutForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!cart.size) { alert('Your cart is empty. Please add an item first.'); return; }
  if (!checkoutForm.reportValidity()) return;
  const data = new FormData(checkoutForm);
  const lines = [...cart.values()].map(item => `• ${item.qty} × ${item.name} — ${money(item.price * item.qty)}`);
  const total = [...cart.values()].reduce((sum, item) => sum + item.price * item.qty, 0);
  const message = [
    'Hello AI Special MacD Joint! I would like to place an order.', '',
    ...lines, '', `FOOD SUBTOTAL: ${money(total)}`, '',
    `Name: ${data.get('customerName')}`, `Phone: ${data.get('customerPhone')}`,
    `Delivery address: ${data.get('deliveryAddress')}`,
    data.get('orderNote') ? `Order note: ${data.get('orderNote')}` : '', '',
    'Please confirm availability, delivery fee, and payment details. Thank you!'
  ].filter(line => line !== undefined).join('\n');
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
});
document.getElementById('year').textContent = new Date().getFullYear();
renderCart();
