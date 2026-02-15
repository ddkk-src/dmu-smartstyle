// ========================================
// DMU SmartStyle - Main JavaScript
// ========================================

// ========== DOM Ready ==========
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initThemeToggle();
  initCart();
  initScrollAnimations();
  initAccordion();
  initModals();
  initForms();
  updateCartBadge();
});

// ========== Navigation ==========
function initNavigation() {
  const hamburger = document.querySelector('.hamburger');
  const navMobile = document.querySelector('.nav-mobile');
  const mobileDropdownHeaders = document.querySelectorAll('.mobile-dropdown-header');

  if (hamburger && navMobile) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMobile.classList.toggle('active');
      document.body.style.overflow = navMobile.classList.contains('active') ? 'hidden' : '';
    });
  }

  mobileDropdownHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const content = header.nextElementSibling;
      const icon = header.querySelector('.dropdown-arrow');

      content.classList.toggle('active');
      if (icon) {
        icon.style.transform = content.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0)';
      }
    });
  });

  // Close mobile menu on link click
  const mobileLinks = document.querySelectorAll('.nav-mobile a:not(.mobile-dropdown-header)');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (hamburger && navMobile) {
        hamburger.classList.remove('active');
        navMobile.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });
}

// ========== Theme Toggle ==========
function initThemeToggle() {
  const themeToggle = document.querySelector('.theme-toggle');
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');

      // Update icon
      const icon = themeToggle.querySelector('span');
      if (icon) {
        icon.textContent = isDark ? '☀️' : '🌙';
      }
    });
  }
}

// ========== Cart Management ==========
function initCart() {
  // Add to cart buttons
  const addToCartBtns = document.querySelectorAll('[data-add-to-cart]');
  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const productId = btn.dataset.productId;
      const productName = btn.dataset.productName;
      const productPrice = btn.dataset.productPrice;
      const productImage = btn.dataset.productImage;

      addToCart({
        id: productId,
        name: productName,
        price: parseFloat(productPrice),
        image: productImage,
        quantity: 1
      });

      showNotification('Product added to cart!');
    });
  });

  // Remove from cart buttons
  const removeBtns = document.querySelectorAll('[data-remove-from-cart]');
  removeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productId = btn.dataset.productId;
      removeFromCart(productId);
      renderCartPage();
    });
  });

  // Quantity change
  const quantityInputs = document.querySelectorAll('.quantity-input');
  quantityInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const productId = input.dataset.productId;
      const quantity = parseInt(input.value);
      updateCartQuantity(productId, quantity);
      renderCartPage();
    });
  });

  // Quantity buttons
  const quantityBtns = document.querySelectorAll('[data-quantity-action]');
  quantityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.dataset.productId;
      const action = btn.dataset.quantityAction;
      const cart = getCart();
      const item = cart.find(i => i.id === productId);

      if (item) {
        const newQuantity = action === 'increase' ? item.quantity + 1 : Math.max(1, item.quantity - 1);
        updateCartQuantity(productId, newQuantity);
        renderCartPage();
      }
    });
  });

  // Checkout button
  const checkoutBtn = document.querySelector('[data-checkout]');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showModal('checkout-disabled-modal');
    });
  }
}

function getCart() {
  const cart = localStorage.getItem('dmu_cart');
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem('dmu_cart', JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product) {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += product.quantity;
  } else {
    cart.push(product);
  }

  saveCart(cart);
}

function removeFromCart(productId) {
  const cart = getCart();
  const updatedCart = cart.filter(item => item.id !== productId);
  saveCart(updatedCart);
}

function updateCartQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);

  if (item) {
    item.quantity = Math.max(1, quantity);
    saveCart(cart);
  }
}

function updateCartBadge() {
  const badge = document.querySelector('.cart-badge');
  if (badge) {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

function renderCartPage() {
  const cartContainer = document.querySelector('[data-cart-items]');
  const summaryContainer = document.querySelector('[data-cart-summary]');

  if (!cartContainer) return;

  const cart = getCart();

  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div style="text-align: center; padding: 4rem 0;">
        <p style="font-size: 1.3rem; color: var(--color-text-secondary); margin-bottom: 2rem;">Your cart is empty</p>
        <a href="products.html" class="btn btn-primary">Explore Our Systems</a>
      </div>
    `;
    if (summaryContainer) {
      summaryContainer.innerHTML = '';
    }
    return;
  }

  cartContainer.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-image" 
           onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'%3E%3Crect fill=\'%23f5f5f7\' width=\'100\' height=\'100\'/%3E%3C/svg%3E'">
      <div class="cart-item-details">
        <h3>${item.name}</h3>
        <p class="cart-item-price">$${item.price.toLocaleString()}/year</p>
        <div class="quantity-selector">
          <button class="quantity-btn" data-quantity-action="decrease" data-product-id="${item.id}">-</button>
          <input type="number" class="quantity-input" value="${item.quantity}" min="1" 
                 data-product-id="${item.id}">
          <button class="quantity-btn" data-quantity-action="increase" data-product-id="${item.id}">+</button>
        </div>
      </div>
      <button class="btn btn-secondary" data-remove-from-cart data-product-id="${item.id}">Remove</button>
    </div>
  `).join('');

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxes = subtotal * 0.20;
  const total = subtotal + taxes;

  if (summaryContainer) {
    summaryContainer.innerHTML = `
      <h2>Order Summary</h2>
      <div class="summary-row">
        <span>Subtotal</span>
        <span>$${subtotal.toLocaleString()}</span>
      </div>
      <div class="summary-row">
        <span>Estimated Tax (20%)</span>
        <span>$${taxes.toLocaleString()}</span>
      </div>
      <div class="summary-row">
        <span>Total</span>
        <span>$${total.toLocaleString()}</span>
      </div>
      <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;" data-checkout>
        Proceed to Checkout
      </button>
      <a href="products.html" class="btn btn-secondary" style="width: 100%; margin-top: 0.5rem; display: inline-flex; justify-content: center;">
        Continue Shopping
      </a>
    `;
  }

  // Re-initialize cart buttons
  initCart();
}

// ========== Scroll Animations ==========
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  const animatedElements = document.querySelectorAll('.fade-in-left, .fade-in-up');
  animatedElements.forEach(el => observer.observe(el));
}

// ========== Accordion ==========
function initAccordion() {
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isActive = item.classList.contains('active');

      // Close all other accordions
      document.querySelectorAll('.accordion-item').forEach(i => {
        if (i !== item) i.classList.remove('active');
      });

      // Toggle current accordion
      item.classList.toggle('active');
    });
  });
}

// ========== Modals ==========
function initModals() {
  const modalTriggers = document.querySelectorAll('[data-modal-trigger]');
  const modalCloses = document.querySelectorAll('[data-modal-close]');
  const modals = document.querySelectorAll('.modal');

  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = trigger.dataset.modalTrigger;
      showModal(modalId);
    });
  });

  modalCloses.forEach(close => {
    close.addEventListener('click', () => {
      const modal = close.closest('.modal');
      if (modal) {
        modal.classList.remove('active');
      }
    });
  });

  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
}

function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

// ========== Forms ==========
function initForms() {
  const contactForm = document.querySelector('[data-contact-form]');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData);

      // Basic validation
      if (!data.name || !data.email || !data.message) {
        showNotification('Please fill in all required fields', 'error');
        return;
      }

      // Simulate form submission
      showNotification('Thank you! We\'ll get back to you within 48 hours.');
      contactForm.reset();
    });
  }

  // Real-time validation
  const inputs = document.querySelectorAll('.form-input, .form-textarea');
  inputs.forEach(input => {
    input.addEventListener('blur', () => {
      validateInput(input);
    });
  });
}

function validateInput(input) {
  const value = input.value.trim();
  const type = input.type;
  let isValid = true;
  let errorMessage = '';

  if (input.required && !value) {
    isValid = false;
    errorMessage = 'This field is required';
  } else if (type === 'email' && value && !isValidEmail(value)) {
    isValid = false;
    errorMessage = 'Please enter a valid email address';
  }

  const errorElement = input.nextElementSibling;
  if (errorElement && errorElement.classList.contains('form-error')) {
    errorElement.textContent = errorMessage;
  } else if (!isValid) {
    const error = document.createElement('div');
    error.className = 'form-error';
    error.textContent = errorMessage;
    input.parentNode.insertBefore(error, input.nextSibling);
  }

  return isValid;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ========== Notifications ==========
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: calc(var(--header-height) + 1rem);
    right: 1rem;
    background: ${type === 'success' ? '#34c759' : '#ff3b30'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    z-index: 3000;
    animation: slideInRight 0.3s ease-in-out;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-in-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add notification animations to document
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// ========== Smooth Scroll ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const headerOffset = document.querySelector('.header').offsetHeight;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  });
});

// ========== Initialize Cart Page on Load ==========
if (document.querySelector('[data-cart-items]')) {
  renderCartPage();
}
