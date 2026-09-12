# Balinda Fashion Store

A clean, modern e-commerce frontend demo built with **HTML, CSS and vanilla JavaScript** — no frameworks.

## Features

- Browse a 16-product catalog across 4 categories
- Cart drawer with quantity controls, persisted via `localStorage`
- Category filters, live search, sorting
- Quick-view modal with size selection
- Wishlist, recently-viewed, promo codes and a multi-step checkout demo
- Fully responsive, accessible, prefers-reduced-motion aware

## Run locally

Just open `index.html` in a browser. No build step, no dependencies.

```
git clone <repo-url>
cd balinda-fashion-store
start index.html
```

## Structure

```
index.html     page markup
css/style.css  styles
js/data.js     product catalog
js/app.js      application logic
```

All product images are generated CSS gradients so the demo runs fully offline. Swap
`p.image` in `js/data.js` for real image URLs when ready.

## License

MIT — built as a frontend demo.