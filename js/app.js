const BOOKS = [
  {
    id: 1,
    title: "Harry Potter and the Philosopher's Stone",
    shortTitle: "Philosopher's Stone",
    price: 450,
    image: "images/1.jpg"
  },
  {
    id: 2,
    title: "Harry Potter and the Chamber of Secrets",
    shortTitle: "Chamber of Secrets",
    price: 450,
    image: "images/2.jpg"
  },
  {
    id: 3,
    title: "Harry Potter and the Prisoner of Azkaban",
    shortTitle: "Prisoner of Azkaban",
    price: 450,
    image: "images/3.jpg"
  },
  {
    id: 4,
    title: "Harry Potter and the Goblet of Fire",
    shortTitle: "Goblet of Fire",
    price: 500,
    image: "images/4.jpg"
  },
  {
    id: 5,
    title: "Harry Potter and the Order of the Phoenix",
    shortTitle: "Order of the Phoenix",
    price: 500,
    image: "images/5.jpg"
  },
  {
    id: 6,
    title: "Harry Potter and the Half-Blood Prince",
    shortTitle: "Half-Blood Prince",
    price: 500,
    image: "images/6.jpg"
  },
  {
    id: 7,
    title: "Harry Potter and the Deathly Hallows",
    shortTitle: "Deathly Hallows",
    price: 500,
    image: "images/7.jpg"
  }
];

const CART_KEY = "owl-quill-cart";
let cart = loadCart();

const bookGrid = document.getElementById("bookGrid");
const cartDrawer = document.getElementById("cartDrawer");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const checkoutButton = document.getElementById("checkoutButton");

function formatBaht(value) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0
  }).format(value);
}

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function fallbackImage(number) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 750">
      <rect width="500" height="750" fill="#2d2522"/>
      <circle cx="250" cy="180" r="82" fill="#b59a64"/>
      <text x="250" y="365" text-anchor="middle" fill="#f5efe5" font-size="42" font-family="Georgia">Harry Potter</text>
      <text x="250" y="430" text-anchor="middle" fill="#cbb887" font-size="28" font-family="Georgia">BOOK ${number}</text>
      <text x="250" y="675" text-anchor="middle" fill="#bcae9d" font-size="18" font-family="Arial">OWL &amp; QUILL</text>
    </svg>
  `;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

function renderBooks() {
  bookGrid.innerHTML = BOOKS.map(book => `
    <article class="book-card">
      <div class="book-cover">
        <img src="${book.image}" alt="${book.title}" onerror="this.onerror=null;this.src='${fallbackImage(book.id)}'">
        <span class="book-number">${book.id}</span>
      </div>
      <div class="book-info">
        <h3 class="book-title">${book.title}</h3>
        <p class="book-subtitle">English edition · Book ${book.id}</p>
        <div class="book-bottom">
          <span class="book-price">${formatBaht(book.price)}</span>
          <button class="add-button" type="button" data-add="${book.id}">Add to cart</button>
        </div>
      </div>
    </article>
  `).join("");
}

function addToCart(id) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, quantity: 1 });
  }
  saveCart();
  renderCart();
  openCart();
}

function changeQuantity(id, delta) {
  const item = cart.find(entry => entry.id === id);
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    cart = cart.filter(entry => entry.id !== id);
  }

  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(entry => entry.id !== id);
  saveCart();
  renderCart();
}

function renderCart() {
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => {
    const book = BOOKS.find(book => book.id === item.id);
    return sum + (book ? book.price * item.quantity : 0);
  }, 0);

  cartCount.textContent = totalQuantity;
  cartTotal.textContent = formatBaht(total);
  checkoutButton.disabled = cart.length === 0;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
    return;
  }

  cartItems.innerHTML = cart.map(item => {
    const book = BOOKS.find(book => book.id === item.id);
    if (!book) return "";

    return `
      <div class="cart-item">
        <img src="${book.image}" alt="" onerror="this.onerror=null;this.src='${fallbackImage(book.id)}'">
        <div>
          <h3>${book.shortTitle}</h3>
          <p>${formatBaht(book.price)} × ${item.quantity}</p>
          <div class="quantity">
            <button type="button" data-minus="${book.id}" aria-label="Decrease quantity">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-plus="${book.id}" aria-label="Increase quantity">+</button>
          </div>
          <button class="remove-item" type="button" data-remove="${book.id}">Remove</button>
        </div>
        <strong class="cart-item-total">${formatBaht(book.price * item.quantity)}</strong>
      </div>
    `;
  }).join("");
}

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
}

document.addEventListener("click", event => {
  const add = event.target.closest("[data-add]");
  const plus = event.target.closest("[data-plus]");
  const minus = event.target.closest("[data-minus]");
  const remove = event.target.closest("[data-remove]");

  if (add) addToCart(Number(add.dataset.add));
  if (plus) changeQuantity(Number(plus.dataset.plus), 1);
  if (minus) changeQuantity(Number(minus.dataset.minus), -1);
  if (remove) removeFromCart(Number(remove.dataset.remove));
});

document.getElementById("cartButton").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
document.getElementById("cartBackdrop").addEventListener("click", closeCart);

checkoutButton.addEventListener("click", () => {
  alert("Checkout will be connected to Supabase in the next step.");
});

renderBooks();
renderCart();
