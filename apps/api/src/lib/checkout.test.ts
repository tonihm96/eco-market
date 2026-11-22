import { describe, expect, test } from "bun:test";

import { formatAddress, planCheckout, type CheckoutProduct } from "./checkout";
import { canTransition } from "./order-status";

const producerId = "producer-1";
const catalog: CheckoutProduct[] = [
  { id: "p1", producerId, name: "Mel", price: "32.00", stock: 5, isActive: true },
  { id: "p2", producerId, name: "Queijo", price: "48.90", stock: 1, isActive: true },
  { id: "p3", producerId: "other", name: "Ovos", price: "15.00", stock: 10, isActive: true },
  { id: "p4", producerId, name: "Inativo", price: "1.00", stock: 10, isActive: false },
];

describe("planCheckout", () => {
  test("computes total in cents without floating point drift", () => {
    const plan = planCheckout(
      { producerId, items: [{ productId: "p1", quantity: 2 }, { productId: "p2", quantity: 1 }] },
      catalog,
    );
    expect(plan).toEqual({
      ok: true,
      total: 112.9,
      lines: [
        { productId: "p1", productName: "Mel", unitPrice: "32.00", quantity: 2 },
        { productId: "p2", productName: "Queijo", unitPrice: "48.90", quantity: 1 },
      ],
    });
  });

  test("merges repeated items before checking stock", () => {
    const plan = planCheckout(
      { producerId, items: [{ productId: "p2", quantity: 1 }, { productId: "p2", quantity: 1 }] },
      catalog,
    );
    expect(plan).toEqual({ ok: false, error: "Not enough stock for Queijo" });
  });

  test("rejects products from another producer", () => {
    const plan = planCheckout({ producerId, items: [{ productId: "p3", quantity: 1 }] }, catalog);
    expect(plan.ok).toBe(false);
  });

  test("rejects inactive or unknown products", () => {
    expect(planCheckout({ producerId, items: [{ productId: "p4", quantity: 1 }] }, catalog).ok).toBe(false);
    expect(planCheckout({ producerId, items: [{ productId: "x", quantity: 1 }] }, catalog).ok).toBe(false);
  });
});

describe("canTransition", () => {
  test("follows the order lifecycle", () => {
    expect(canTransition("paid", "preparing")).toBe(true);
    expect(canTransition("preparing", "shipped")).toBe(true);
    expect(canTransition("delivered", "canceled")).toBe(false);
    expect(canTransition("pending", "delivered")).toBe(false);
  });
});

describe("formatAddress", () => {
  test("omits empty complement", () => {
    expect(
      formatAddress({
        street: "Rua A",
        number: "10",
        complement: null,
        district: "Centro",
        city: "Joaçaba",
        state: "SC",
        zipCode: "89600-000",
      }),
    ).toBe("Rua A, 10 - Centro - Joaçaba/SC - CEP 89600-000");
  });
});
