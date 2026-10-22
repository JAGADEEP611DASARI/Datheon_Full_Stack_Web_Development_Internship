# Forma — E-Commerce Product Catalog & Interactive Shopping Cart (Task 4)

A responsive e-commerce storefront built with HTML, CSS, and vanilla JavaScript. It loads product data from FakeStoreAPI and includes category filtering, search, cart quantity controls, localStorage persistence, calculated totals, and a simulated checkout flow.

## Features
- Fetch product catalog from FakeStoreAPI (`https://fakestoreapi.com/products`)
- Product cards with images, prices, ratings, and curated badges
- Filter by Electronics, Jewelry, Men's clothing, and Women's clothing
- Search products by title, category, or description
- Sort by featured order, price, or rating
- Slide-out cart drawer with item count badge
- Add/remove products and increase/decrease quantities
- Persist cart contents in browser localStorage
- Calculate subtotal, shipping, estimated 8% tax, and total
- Free shipping for subtotals of $75 or more; $5.99 otherwise
- Simulated checkout modal with basic form validation and order confirmation
- Responsive mobile and desktop layout
- Loading indicator and graceful API failure message
- Keyboard Escape closes drawer/modal; accessible labels and live announcements

## Run locally
1. Extract the project ZIP.
2. Open `index.html` in a modern browser, or use VS Code Live Server.
3. Ensure you have an internet connection to load products and images from FakeStoreAPI.
4. Add products to the bag, adjust quantities, and try the demo checkout.

No API key, npm install, or build process is required. Checkout is only a demonstration and does not collect payment or submit personal information to a server. Use sample details while testing.

## Tech stack
HTML5, CSS3 (Grid, Flexbox, responsive media queries), JavaScript ES6+, Fetch API, FakeStoreAPI, DOM manipulation, localStorage.

## Project structure
```
Task-4-Ecommerce-Shopping-Cart/
├── index.html
├── style.css
├── script.js
└── README.md
```
