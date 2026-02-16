export interface Product {
  _id?: string;
  id: string;
  title: string;
  price: string;
  oldPrice?: string;
  image: string;
  images: string[];
  priceNumber: number;
  createdAtMs: number;
  isNewArrival: boolean;
  isBestSeller: boolean;
  stockQty: number;
  availability: string;
  description?: string;
  sku?: string;
  vendor?: string;
  type?: string;
  tag?: ProductTag;
  detailDescription?: string;
}
export interface Invoice {
  orderNumber: string;
  date: string;
  status: string;
  shippingAddress: AddressInfo;
  items: {
    productName: string;
    quantity: number;
    totalPrice: number;
  }[];
  financials: {
    subtotal: number;
    shipping: number;
    discount: number;
    couponCode?: string;
    tax?: number;
    total: number;
    currency: string;
  };
}

export interface ApplyCouponResponse {
  success: boolean;
  message: string;
  data?: {
    cart: Cart;
    manualCoupon: {
      code: string;
      discountAmount: number;
      type: string;
    };
    totalDiscount: number;
    finalAmount: number;
  };
}

export interface RemoveCouponResponse {
  success: boolean;
  message: string;
  data?: {
    cart: Cart;
  };
}
export interface BackendProduct {
  _id: string;
  name: string;
  description?: string;
  images?: string[];
  thumbnail?: string;
  price: number;
  mrp?: number;
  stockQty: number;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  createdAt?: string;
  sku?: string;
  vendor?: string;
  type?: string;
  detailDescription?: string;
}

export interface ProductListResponse {
  data: Product[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface ProductFilters {
  search?: string;
  categoryId?: string | string[];
  categorySlug?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  inStock?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export type ProductTagVariant = "primary" | "secondary";

export interface ProductTag {
  label: string;
  variant?: ProductTagVariant;
}

export interface CommonProductCardProps {
  productId: string;
  title: string;
  price: string;
  priceNumber?: number;
  image: string;
  oldPrice?: string;
  alwaysShowWishlistIcon?: boolean;
  showAddToCart?: boolean;
  onAddToCart?: () => void;
  tag?: ProductTag;
  inStock?: boolean;
}

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  unitPrice: number;
  qty: number;
  quantity: number;
  packId?: string;
  _id?: string;
  id?: string;
}

export interface Cart {
  _id: string;
  items: CartItem[];
  subtotalAmount: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  status: "active" | "completed" | "abandoned";
  id: string;
  total: number;
}

export interface BackendProduct {
  _id: string;
  name: string;
  thumbnail?: string;
}

export interface BackendItem {
  _id: string;
  productId: BackendProduct | string;
  name?: string;
  image?: string;
  price?: number;
  unitPrice?: number;
  qty?: number;
  quantity?: number;
  packId?: string;
}

export interface BackendCartResponse {
  _id: string;
  items: BackendItem[];
  subtotalAmount: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  status: "active" | "completed" | "abandoned";
}
export interface Address {
  _id: string;
  fullName: string;
  mobile: string;
  pincode: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  country: string;
  isDefault: boolean;
  label: string;
}

export interface AddressFormData {
  fullName: string;
  mobile: string;
  pincode: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  country?: string;
  isDefault: boolean;
  label: string;
}

export interface AddressInfo {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  mobile: string;
}

export type CouponType = "PERCENT" | "FLAT" | "FREE_SHIPPING" | "PACK_PRICE";

export interface Coupon {
  _id: string;
  code: string;
  type: CouponType;
  value: number;
  minCartAmount?: number;
  maxDiscountAmount?: number;
  description?: string;
  startAt?: string;
  endAt?: string;
  isActive: boolean;
  freeShipping?: boolean;
}

export interface FetchCouponsResponse {
  success: boolean;
  data: {
    coupons: Coupon[];
  };
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface SocialPost {
  id: number;
  image: string;
  link: string;
}

export interface InvoiceOrder {
  orderNumber: string;
  date: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: AddressInfo;
  billingAddress: AddressInfo;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  currency: string;
}

export interface Category {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  type: "category" | "collection";
}

export interface BestSellerItem {
  _id?: string;
  id?: string;
  title: string;
  price: number;
  images?: string[];
  image?: string;
}
