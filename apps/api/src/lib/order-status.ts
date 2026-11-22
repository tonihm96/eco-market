import type { OrderStatus } from "@eco-market/shared";

// Allowed order lifecycle transitions
const transitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "canceled"],
  paid: ["preparing", "canceled"],
  preparing: ["shipped", "canceled"],
  shipped: ["delivered"],
  delivered: [],
  canceled: [],
};

export const canTransition = (from: OrderStatus, to: OrderStatus) => transitions[from].includes(to);
