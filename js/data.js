/* ===================================================================
   Balinda Fashion Store — product catalog
   Images are generated CSS-gradient placeholders (see style.css).
   =================================================================== */

const PRODUCTS = [
  {
    id: 1,
    name: "Aurelia Silk Midi Dress",
    category: "dresses",
    price: 185,
    oldPrice: 225,
    badge: "Sale",
    stock: 14,
    colors: ["#7c5a4a", "#f0e6d8", "#3a3340"],
    rating: 4.8,
    image: ["#e8d6c4", "#c8a68a"],
    description: "Satin-feel midi dress with a soft cowl neckline and concealed zip."
  },
  {
    id: 2,
    name: "Celeste Linen Wrap Dress",
    category: "dresses",
    price: 129,
    oldPrice: null,
    badge: null,
    stock: 26,
    colors: ["#b9b48f", "#d8c4a8", "#5a463c"],
    rating: 4.6,
    image: ["#efead9", "#b9b48f"],
    description: "Breezy European linen wrap dress with ties at the waist."
  },
  {
    id: 3,
    name: "Vera Evening Gown",
    category: "dresses",
    price: 340,
    oldPrice: null,
    badge: "New",
    stock: 5,
    colors: ["#17151f", "#3a3340", "#8a2b45"],
    rating: 4.9,
    image: ["#3a3340", "#17151f"],
    description: "Floor-length pleated gown with a sweeping train and delicate straps."
  },
  {
    id: 4,
    name: "Nadia Floral Mini Dress",
    category: "dresses",
    price: 110,
    oldPrice: 140,
    badge: "Sale",
    stock: 0,
    colors: ["#c98f9b", "#f4dde0"],
    rating: 4.4,
    image: ["#f4dde0", "#c98f9b"],
    description: "Playful puff-sleeve mini dress printed with hand-painted blooms."
  },
  {
    id: 5,
    name: "Eloise Cashmere Coat",
    category: "outerwear",
    price: 420,
    oldPrice: null,
    badge: "New",
    stock: 8,
    colors: ["#6f5f4e", "#b8a591", "#3a3340"],
    rating: 4.9,
    image: ["#b8a591", "#6f5f4e"],
    description: "Belted cashmere-blend coat with a fluid, oversized silhouette."
  },
  {
    id: 6,
    name: "Dune Trench Coat",
    category: "outerwear",
    price: 260,
    oldPrice: 295,
    badge: "Sale",
    stock: 12,
    colors: ["#8d7c61", "#ccbea6"],
    rating: 4.7,
    image: ["#ccbea6", "#8d7c61"],
    description: "Classic double-breasted trench in water-repellent cotton gabardine."
  },
  {
    id: 7,
    name: "Poppy Wool Blazer",
    category: "outerwear",
    price: 198,
    oldPrice: null,
    badge: null,
    stock: 9,
    colors: ["#44202c", "#7c3a4a", "#17151f"],
    rating: 4.6,
    image: ["#7c3a4a", "#44202c"],
    description: "Structured single-button blazer in deep berry merino wool."
  },
  {
    id: 8,
    name: "Amara Quilted Jacket",
    category: "outerwear",
    price: 145,
    oldPrice: null,
    badge: null,
    stock: 18,
    colors: ["#333f3c", "#5e6f6a"],
    rating: 4.5,
    image: ["#5e6f6a", "#333f3c"],
    description: "Lightweight quilted jacket — perfect between seasons."
  },
  {
    id: 9,
    name: "Seren Cashmere Sweater",
    category: "knitwear",
    price: 165,
    oldPrice: null,
    badge: "New",
    stock: 6,
    colors: ["#8a7661", "#c9b7a2", "#5a463c"],
    rating: 4.8,
    image: ["#c9b7a2", "#8a7661"],
    description: "Ribbed crew-neck cashmere sweater in warm oatmeal."
  },
  {
    id: 10,
    name: "Iris Fisherman Knit",
    category: "knitwear",
    price: 118,
    oldPrice: 145,
    badge: "Sale",
    stock: 3,
    colors: ["#9a6f96", "#d8c2d4"],
    rating: 4.5,
    image: ["#d8c2d4", "#9a6f96"],
    description: "Chunky cable-knit jumper with a relaxed fit."
  },
  {
    id: 11,
    name: "Maren Cardigan",
    category: "knitwear",
    price: 135,
    oldPrice: null,
    badge: null,
    stock: 15,
    colors: ["#767b87", "#b9bcc4", "#efead9"],
    rating: 4.7,
    image: ["#b9bcc4", "#767b87"],
    description: "Longline merino cardigan with tortoiseshell buttons."
  },
  {
    id: 12,
    name: "Sage V-Neck Rib Top",
    category: "knitwear",
    price: 88,
    oldPrice: null,
    badge: null,
    stock: 22,
    colors: ["#7d8870", "#b5bda5"],
    rating: 4.3,
    image: ["#b5bda5", "#7d8870"],
    description: "Slim-fit ribbed top in a soft organic cotton blend."
  },
  {
    id: 13,
    name: "Muse Leather Tote",
    category: "accessories",
    price: 210,
    oldPrice: 260,
    badge: "Sale",
    stock: 7,
    colors: ["#4d3a29", "#8a6a4a", "#17151f"],
    rating: 4.8,
    image: ["#8a6a4a", "#4d3a29"],
    description: "Spacious full-grain leather tote with an internal laptop sleeve."
  },
  {
    id: 14,
    name: "Soleil Silk Scarf",
    category: "accessories",
    price: 95,
    oldPrice: null,
    badge: "New",
    stock: 30,
    colors: ["#a86f1f", "#e2b25c", "#7c3a4a"],
    rating: 4.6,
    image: ["#e2b25c", "#a86f1f"],
    description: "Hand-rolled printed silk scarf — tie it, drape it, love it."
  },
  {
    id: 15,
    name: "Aura Gold Hoops",
    category: "accessories",
    price: 72,
    oldPrice: null,
    badge: null,
    stock: 40,
    colors: ["#6e5317", "#c9a24b"],
    rating: 4.7,
    image: ["#c9a24b", "#6e5317"],
    description: "Layered 18k gold-plated hoops, feather-light on the ear."
  },
  {
    id: 16,
    name: "Vela Slip-On Mules",
    category: "accessories",
    price: 128,
    oldPrice: null,
    badge: null,
    stock: 0,
    colors: ["#2c211c", "#5a463c"],
    rating: 4.5,
    image: ["#5a463c", "#2c211c"],
    description: "Chunky-sole square-toe mules in buttery-soft leather."
  }
];

// Unique categories derived from catalog
const CATEGORIES = [...new Set(PRODUCTS.map((p) => p.category))];