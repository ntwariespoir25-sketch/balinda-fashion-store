/* ===================================================================
   Balinda Fashion Store — shared config and utilities
   =================================================================== */

const CONFIG = {
  CURRENCY: { symbol: "$" },
  CART_KEY: "balinda-cart",
  CART_VERSION: 2,
  WISHLIST_KEY: "balinda-wishlist",
  RECENT_KEY: "balinda-recent",
  SALE_KEY: "balinda-sale-end",
  FREE_SHIP_THRESHOLD: 100,
  MAX_QTY: 10,
  SIZES: ["XS", "S", "M", "L", "XL"],
  PROMOS: {
    BALINDA10: 0.1,
    NEWSEASON: 0.15,
    FREESHIP: 0
  }
};

const formatMoney = (n) => `${CONFIG.CURRENCY.symbol}${n.toFixed(2)}`;

const productBg = (p) =>
  `background-image: radial-gradient(circle at 30% 25%, ${p.image[0]}, ${p.image[1]} 78%),
     linear-gradient(160deg, ${p.image[0]}, ${p.image[1]});`;

const bgImageSource = (p) =>
  productBg(p).replace("background-image:", "").replace(/;$/, "");