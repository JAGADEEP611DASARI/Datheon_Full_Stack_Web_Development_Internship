(() => {
  'use strict';
  const API_URL = 'https://fakestoreapi.com/products';
  const CART_KEY = 'forma-shopping-cart-v1';
  const $ = selector => document.querySelector(selector);

  const productGrid = $('#productGrid');
  const loadingProducts = $('#loadingProducts');
  const catalogMessage = $('#catalogMessage');
  const productTemplate = $('#productTemplate');
  const cartItemTemplate = $('#cartItemTemplate');
  const cartDrawer = $('#cartDrawer');
  const drawerBackdrop = $('#drawerBackdrop');
  const checkoutBackdrop = $('#checkoutBackdrop');
  const productSearch = $('#productSearch');
  let products = [];
  let cart = loadCart();
  let activeCategory = 'all';
  let lastFocusedElement = null;
  let lastOrder = null;

  $('#year').textContent = new Date().getFullYear();

  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(saved) ? saved.filter(item =>
        item && Number.isInteger(item.id) && Number.isInteger(item.quantity) &&
        item.quantity > 0 && item.quantity <= 99
      ) : [];
    } catch (error) {
      console.warn('Could not load saved cart:', error);
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      return true;
    } catch (error) {
      console.error('Could not persist cart:', error);
      showCatalogMessage('Your browser could not save the cart. Check local storage settings.');
      return false;
    }
  }

  async function loadProducts() {
    loadingProducts.hidden = false;
    catalogMessage.hidden = true;
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`Product service returned ${response.status}.`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Unexpected product data received.');
      products = data.map(product => ({
        ...product,
        id: Number(product.id),
        price: Number(product.price),
        rating: product.rating || { rate: 0, count: 0 }
      }));
      loadingProducts.hidden = true;
      renderProducts();
      renderCart();
      $('#catalogCount').textContent = `${products.length} products to explore`;
    } catch (error) {
      console.error(error);
      loadingProducts.hidden = true;
      showCatalogMessage('We couldn’t load the collection right now. Check your internet connection and refresh to try again.');
      $('#catalogCount').textContent = 'Collection unavailable';
    }
  }

  function showCatalogMessage(message) {
    catalogMessage.textContent = message;
    catalogMessage.hidden = false;
  }

  function formatCategory(category) {
    return category === "men's clothing" ? "Men's clothing" :
      category === "women's clothing" ? "Women's clothing" :
      category === 'jewelery' ? 'Jewelry' :
      category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Collection';
  }

  function badgeFor(product) {
    if (product.rating?.rate >= 4.5) return 'TOP RATED';
    if (product.rating?.count > 250) return 'FAVORITE';
    if (product.price < 25) return 'GOOD FIND';
    return 'CURATED PICK';
  }

  function renderProducts() {
    const query = productSearch.value.trim().toLowerCase();
    let filtered = products.filter(product => {
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      const matchesSearch = !query || `${product.title} ${product.description} ${product.category}`.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });

    switch ($('#sortProducts').value) {
      case 'price-low': filtered.sort((a, b) => a.price - b.price); break;
      case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
      case 'rating': filtered.sort((a, b) => b.rating.rate - a.rating.rate); break;
      default: filtered.sort((a, b) => a.id - b.id);
    }

    productGrid.replaceChildren();
    catalogMessage.hidden = true;
    if (!filtered.length && products.length) {
      showCatalogMessage('No products match those filters. Try another category or search.');
      return;
    }

    filtered.forEach(product => {
      const fragment = productTemplate.content.cloneNode(true);
      const card = fragment.querySelector('.product-card');
      const image = fragment.querySelector('.product-image');
      image.src = product.image;
      image.alt = product.title;
      image.addEventListener('error', () => {
        image.alt = `${product.title} image unavailable`;
        image.removeAttribute('src');
      }, { once: true });
      fragment.querySelector('.product-badge').textContent = badgeFor(product);
      fragment.querySelector('.product-category').textContent = formatCategory(product.category);
      fragment.querySelector('.product-title').textContent = product.title;
      fragment.querySelector('.product-price').textContent = money(product.price);
      fragment.querySelector('.product-rating').textContent = `★ ${Number(product.rating.rate).toFixed(1)} (${product.rating.count})`;
      const quickAdd = fragment.querySelector('.quick-add');
      quickAdd.addEventListener('click', () => addToCart(product.id));
      card.setAttribute('aria-label', `${product.title}, ${money(product.price)}`);
      productGrid.append(fragment);
    });
  }

  function money(value) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  function addToCart(id) {
    const product = products.find(item => item.id === id);
    if (!product) return;
    const existing = cart.find(item => item.id === id);
    if (existing) {
      if (existing.quantity >= 99) {
        announce('Maximum quantity is 99 per product.');
        return;
      }
      existing.quantity += 1;
    } else {
      cart.push({ id, quantity: 1 });
    }
    if (!saveCart()) return;
    renderCart();
    announce('Added to your bag.');
  }

  function updateQuantity(id, change) {
    const item = cart.find(entry => entry.id === id);
    if (!item) return;
    const next = item.quantity + change;
    if (next < 1) {
      removeFromCart(id);
      return;
    }
    if (next > 99) {
      announce('Maximum quantity is 99 per product.');
      return;
    }
    item.quantity = next;
    if (!saveCart()) return;
    renderCart();
  }

  function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    if (!saveCart()) return;
    renderCart();
    announce('Item removed from your bag.');
  }

  function cartProducts() {
    return cart.map(item => {
      const product = products.find(entry => entry.id === item.id);
      return product ? { ...product, quantity: item.quantity } : null;
    }).filter(Boolean);
  }

  function calculateTotals() {
    const subtotal = cartProducts().reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal === 0 || subtotal >= 75 ? 0 : 5.99;
    const tax = subtotal * 0.08;
    return { subtotal, shipping, tax, total: subtotal + shipping + tax };
  }

  function renderCart() {
    const items = cartProducts();
    const quantityCount = items.reduce((sum, item) => sum + item.quantity, 0);
    $('#cartBadge').textContent = quantityCount > 99 ? '99+' : quantityCount;
    $('#cartItemCount').textContent = `${quantityCount} ${quantityCount === 1 ? 'item' : 'items'} in your bag`;
    $('#cartItems').replaceChildren();
    items.forEach(item => {
      const fragment = cartItemTemplate.content.cloneNode(true);
      const image = fragment.querySelector('.cart-item-image');
      image.src = item.image;
      image.alt = item.title;
      image.addEventListener('error', () => image.removeAttribute('src'), { once: true });
      fragment.querySelector('.cart-item-category').textContent = formatCategory(item.category);
      fragment.querySelector('.cart-item-title').textContent = item.title;
      fragment.querySelector('.cart-item-price').textContent = money(item.price * item.quantity);
      fragment.querySelector('.quantity-value').textContent = item.quantity;
      fragment.querySelector('.quantity-minus').addEventListener('click', () => updateQuantity(item.id, -1));
      fragment.querySelector('.quantity-plus').addEventListener('click', () => updateQuantity(item.id, 1));
      fragment.querySelector('.remove-item').addEventListener('click', () => removeFromCart(item.id));
      $('#cartItems').append(fragment);
    });

    const empty = items.length === 0;
    $('#emptyCart').hidden = !empty;
    $('#cartSummary').hidden = empty;
    if (!empty) {
      const totals = calculateTotals();
      $('#cartSubtotal').textContent = money(totals.subtotal);
      $('#cartShipping').textContent = totals.shipping === 0 ? (totals.subtotal >= 75 ? 'FREE' : money(0)) : money(totals.shipping);
      $('#cartTax').textContent = money(totals.tax);
      $('#cartTotal').textContent = money(totals.total);
      $('#shippingNote').textContent = totals.subtotal >= 75 ? 'You unlocked free shipping!' : `Add ${money(75 - totals.subtotal)} more for free shipping.`;
    }
  }

  function openCart() {
    lastFocusedElement = document.activeElement;
    drawerBackdrop.hidden = false;
    cartDrawer.classList.add('open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('#closeCart').focus();
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    drawerBackdrop.hidden = true;
    document.body.style.overflow = '';
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  function openCheckout() {
    if (!cartProducts().length) return;
    closeCart();
    checkoutBackdrop.hidden = false;
    $('#checkoutFormView').hidden = false;
    $('#orderSuccess').hidden = true;
    $('#customerName').focus();
  }

  function closeCheckout() {
    checkoutBackdrop.hidden = true;
    document.body.style.overflow = '';
    $('#openCart').focus();
  }

  function announce(message) {
    let live = $('#liveAnnouncement');
    if (!live) {
      live = document.createElement('div');
      live.id = 'liveAnnouncement';
      live.className = 'sr-only';
      live.setAttribute('role', 'status');
      live.setAttribute('aria-live', 'polite');
      document.body.append(live);
    }
    live.textContent = message;
  }

  $('#categoryTabs').addEventListener('click', event => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    activeCategory = button.dataset.category;
    document.querySelectorAll('.category-tab').forEach(tab => tab.classList.toggle('active', tab === button));
    renderProducts();
  });
  productSearch.addEventListener('input', renderProducts);
  $('#sortProducts').addEventListener('change', renderProducts);
  $('#searchFocus').addEventListener('click', () => {
    $('#shop').scrollIntoView({ behavior: 'smooth' });
    productSearch.focus({ preventScroll: true });
  });
  $('#openCart').addEventListener('click', openCart);
  $('#closeCart').addEventListener('click', closeCart);
  $('#continueShopping').addEventListener('click', closeCart);
  drawerBackdrop.addEventListener('click', closeCart);
  $('#checkoutButton').addEventListener('click', openCheckout);
  $('#closeCheckout').addEventListener('click', closeCheckout);
  checkoutBackdrop.addEventListener('click', event => {
    if (event.target === checkoutBackdrop) closeCheckout();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (!checkoutBackdrop.hidden) closeCheckout();
      else if (cartDrawer.classList.contains('open')) closeCart();
    }
  });

  $('#checkoutForm').addEventListener('submit', event => {
    event.preventDefault();
    const name = $('#customerName').value.trim();
    const email = $('#customerEmail').value.trim();
    const address = $('#customerAddress').value.trim();
    if (!name || !email || !address) return;
    const totals = calculateTotals();
    lastOrder = {
      reference: `FORMA-${Date.now().toString().slice(-7)}`,
      name,
      email,
      itemCount: cartProducts().reduce((sum, item) => sum + item.quantity, 0),
      total: totals.total
    };
    $('#successMessage').textContent = `Thanks, ${name}. Your demo order for ${lastOrder.itemCount} item(s), totaling ${money(lastOrder.total)}, has been confirmed. No payment was processed.`;
    $('#orderReference').textContent = `Order reference: ${lastOrder.reference}`;
    $('#checkoutFormView').hidden = true;
    $('#orderSuccess').hidden = false;
    cart = [];
    saveCart();
    renderCart();
  });

  $('#finishOrder').addEventListener('click', () => {
    closeCheckout();
    $('#checkoutForm').reset();
    $('#shop').scrollIntoView({ behavior: 'smooth' });
  });

  renderCart();
  loadProducts();
})();
