import type { Multilingual } from "./models";

export interface CartProduct {
  id: string;
  name: Multilingual;
  price: string;
  discountPrice?: string;
  stockQuantity: number;
  isActive: boolean;
  requiresPrescription: boolean;
  images: string[];
  pharmacy: {
    id: string;
    name: Multilingual;
    isActive: boolean;
  };
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: CartProduct;
}

export interface Cart {
  id: string;
  userId: string;
  pharmacyId?: string;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
}

export interface AddToCartDto {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}
