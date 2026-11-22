import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import type { Product } from "@eco-market/shared";

export type CartItem = { product: Product; quantity: number };
export type Cart = { producerId: string | null; items: CartItem[] };

const emptyCart: Cart = { producerId: null, items: [] };

// Pure cart transitions (an order always belongs to a single producer)
export const addToCart = (cart: Cart, product: Product, quantity: number): Cart => {
  const base = cart.producerId === product.producerId ? cart : { producerId: product.producerId, items: [] };
  const existing = base.items.find((item) => item.product.id === product.id);
  const items = existing
    ? base.items.map((item) =>
        item.product.id === product.id
          ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
          : item,
      )
    : [...base.items, { product, quantity: Math.min(quantity, product.stock) }];
  return { producerId: product.producerId, items };
};

export const setCartQuantity = (cart: Cart, productId: string, quantity: number): Cart => {
  const items =
    quantity <= 0
      ? cart.items.filter((item) => item.product.id !== productId)
      : cart.items.map((item) => (item.product.id === productId ? { ...item, quantity } : item));
  return items.length === 0 ? emptyCart : { ...cart, items };
};

export const cartTotal = (cart: Cart) =>
  cart.items.reduce((sum, item) => sum + Math.round(Number(item.product.price) * 100) * item.quantity, 0) /
  100;

type CartContextValue = {
  cart: Cart;
  add: (product: Product, quantity: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart>(emptyCart);
  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      add: (product, quantity) => setCart((current) => addToCart(current, product, quantity)),
      setQuantity: (productId, quantity) =>
        setCart((current) => setCartQuantity(current, productId, quantity)),
      clear: () => setCart(emptyCart),
    }),
    [cart],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === null) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
