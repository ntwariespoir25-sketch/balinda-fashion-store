# Balinda Fashion Store

A clean, modern e-commerce frontend demo built with **HTML, CSS and vanilla JavaScript** — no frameworks.

## Features

- Browse a 16-product catalog across 4 categories
- Cart drawer with quantity controls, persisted via `localStorage`
- Category filters, live search with suggestions, sorting (incl. discount-first)
- Quick-view modal with size selection
- Wishlist with counter + wishlist-only browsing
- Recently-viewed strip, promo codes and a multi-step checkout demo
- Free-shipping progress bar, sale countdown, toast queue
- Marketing sections: testimonials, press marquee, Instagram gallery
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
index.html        page markup
css/style.css     styles
manifest.json     PWA manifest
robots.txt        crawl config
sitemap.xml       site map
CHANGELOG.md      release notes
js/config.js      shared config + utilities
js/data.js        product catalog
js/app.js         application logic
```

All product images are generated CSS gradients so the demo runs fully offline. Swap
`p.image` in `js/data.js` for real image URLs when ready.

## Promo codes

`BALINDA10` — 10% off · `NEWSEASON` — 15% off · `FREESHIP` — free shipping.

## License

MIT — built as a frontend demo.