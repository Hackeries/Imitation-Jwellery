// ==================== IMAGE CONSTANTS ====================
export const FALLBACK_IMAGE = "/img/jewelrySet.webp";

export const IMAGE_PATHS = {
  PENDANT: "/img/pendant.webp",
  JEWELRY_SET: "/img/jewelrySet.webp",
  EARRING: "/img/earring.webp",
  BRACELET: "/img/bracelet-img.webp",
  NECKLACE: "/img/necklace.webp",
  EARRING_1: "/img/earring-1.webp",
  JEWELRY_1: "/img/jwelry1.webp",
} as const;

// ==================== PRODUCT CONSTANTS ====================
export const JEWELRY_SET_SLUGS = ["pendant", "earring", "bracelet", "necklace"] as const;

export const FALLBACK_NEW_ARRIVAL_PRODUCTS = [
  {
    id: "na-1",
    title: "Rose Gold Pendant",
    price: "Rs. 1,299.00",
    priceNumber: 1299,
    image: IMAGE_PATHS.PENDANT,
  },
  {
    id: "na-2",
    title: "Solitaire Ring",
    price: "Rs. 2,499.00",
    priceNumber: 2499,
    image: IMAGE_PATHS.JEWELRY_SET,
  },
  {
    id: "na-3",
    title: "Crystal Studs",
    price: "Rs. 899.00",
    priceNumber: 899,
    image: IMAGE_PATHS.EARRING,
  },
  {
    id: "na-4",
    title: "Silver Charm Bracelet",
    price: "Rs. 1,599.00",
    priceNumber: 1599,
    image: IMAGE_PATHS.BRACELET,
  },
  {
    id: "na-5",
    title: "Pearl Necklace Set",
    price: "Rs. 3,999.00",
    priceNumber: 3999,
    image: IMAGE_PATHS.NECKLACE,
  },
] as const;

// ==================== REVIEW CONSTANTS ====================
export const FALLBACK_HOME_REVIEWS = [
  {
    id: 1,
    name: "Simran K.",
    text: "Sleek, minimal, and beautifully bold. My new favorite necklace.",
    image: "/img/pendant_old.webp",
  },
  {
    id: 2,
    name: "Neha V.",
    text: "Absolutely gorgeous with delicate, eye-catching details.",
    image: "/img/pendant.webp",
  },
  {
    id: 3,
    name: "Priya R.",
    text: "Delicate, feminine, and perfect for everyday wear.",
    image: "/img/pendant_old.webp",
  },
  {
    id: 4,
    name: "Ananya T.",
    text: "Elegant, minimal, and effortlessly versatile.",
    image: "/img/bracelet-img.webp",
  },
  {
    id: 5,
    name: "Riya S.",
    text: "Sleek design that pairs perfectly with every outfit.",
    image: "/img/earring.webp",
  },
  {
    id: 6,
    name: "Ishita M.",
    text: "Beautiful craftsmanship and a truly premium feel.",
    image: "/img/pendant.webp",
  },
] as const;

// ==================== FAQ CONSTANTS ====================
export const FAQ_DATA = [
  {
    question: "Are Privora products authentic?",
    answer:
      "Yes. All Privora products are thoughtfully designed and crafted using high-quality materials, ensuring authenticity, durability, and timeless appeal.",
  },
  {
    question: "Is your jewelry safe for sensitive skin?",
    answer:
      "Absolutely. Our jewelry is hypoallergenic and carefully finished to be gentle on the skin, making it suitable for everyday wear.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Orders are usually processed within 24-48 hours and delivered within 3-7 business days, depending on your location.",
  },
  {
    question: "Do you offer Cash on Delivery (COD)?",
    answer: "Yes, we offer Cash on Delivery on eligible orders for your convenience.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Once your order is shipped, you'll receive a tracking link via email or SMS to monitor your delivery in real time.",
  },
  {
    question: "What is your return or exchange policy?",
    answer:
      "We offer easy returns or exchanges within a specified period, provided the product is unused and in its original packaging.",
  },
  {
    question: "How should I care for my jewelry?",
    answer:
      "To maintain its shine, store your jewelry in a dry place, avoid contact with water or chemicals, and gently wipe it with a soft cloth after use.",
  },
  {
    question: "How can I contact Privora support?",
    answer:
      "You can reach our support team through the Contact Us page or email us directly. We're always happy to help.",
  },
] as const;

// ==================== COMPANY INFORMATION ====================
export const COMPANY_INFO = {
  NAME: "Privora",
  EMAIL: "privora.in@gmail.com",
  PHONE: "+91 96995 52754",
  INSTAGRAM_URL: "https://instagram.com/privora.in",
  DESCRIPTION:
    "At Privora, contemporary elegance blends seamlessly with affordability. Our jewelry is thoughtfully designed to resonate with the modern Indian woman.",
} as const;

// ==================== BILLING ADDRESS ====================
export const BILLING_ADDRESS = {
  fullName: "Privora",
  line1: "Mi-Casa, Atur Nagar, Undri",
  line2: "Undri–Hadapsar Road",
  city: "Pune",
  state: "Maharashtra",
  pincode: "411060",
  country: "India",
  mobile: "+91 96995 52754",
} as const;

// ==================== INVOICE CONSTANTS ====================
export const INVOICE_COLORS = {
  BRAND: "#8B6E4E",
  GRAY: "#555555",
} as const;

// ==================== SOCIAL POSTS ====================
export const FALLBACK_SOCIAL_POSTS: Array<{
  id: number;
  image: string;
  link: string;
}> = [
  { id: 1, image: "/img/earring.webp", link: "https://instagram.com/privora.in" },
  { id: 2, image: "/img/pendant.webp", link: "https://instagram.com/privora.in" },
  { id: 3, image: "/img/necklace.webp", link: "https://instagram.com/privora.in" },
  { id: 4, image: "/img/bracelets.webp", link: "https://instagram.com/privora.in" },
  { id: 5, image: "/img/jewelrySet.webp", link: "https://instagram.com/privora.in" },
];

// ==================== PAGINATION ====================
export const DEFAULT_PAGE_SIZE = 20;
export const INITIAL_PAGE = 1;

// ==================== QUERY KEYS ====================
export const QUERY_KEYS = {
  PRODUCTS: "products",
  PRODUCTS_LIST: ["products", "list"],
  PRODUCTS_INFINITE: ["products", "infinite"],
  PRODUCTS_CATEGORY: ["products", "category"],
  PRODUCTS_BEST_SELLER: ["products", "best-seller"],
  HOME_CATEGORIES: ["home-categories"],
} as const;

// ==================== CACHE TIMES ====================
export const CACHE_TIMES = {
  SHORT: 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 10 * 60 * 1000, // 10 minutes
} as const;

// ==================== API CONSTANTS ====================
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8018";

// ==================== SESSION STORAGE KEYS ====================
export const STORAGE_KEYS = {
  SUBSCRIBE_POPUP_SHOWN: "subscribe_popup_shown",
  TOKEN: "token",
  AUTH_TOKEN: "authToken",
  AUTHENTICATED_USER: "authenticatedUser",
} as const;
