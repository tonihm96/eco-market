import type { CheckoutInput } from "@eco-market/shared";

export type CheckoutProduct = {
  id: string;
  producerId: string;
  name: string;
  price: string;
  stock: number;
  isActive: boolean;
};

export type CheckoutLine = {
  productId: string;
  productName: string;
  unitPrice: string;
  quantity: number;
};

export type CheckoutPlan =
  | { ok: true; lines: CheckoutLine[]; total: number }
  | { ok: false; error: string };

// Pure function: validates the cart against current products and computes totals
export const planCheckout = (
  input: Pick<CheckoutInput, "producerId" | "items">,
  products: CheckoutProduct[],
): CheckoutPlan => {
  const productsById = new Map(products.map((product) => [product.id, product]));
  const quantities = input.items.reduce(
    (acc, item) => acc.set(item.productId, (acc.get(item.productId) ?? 0) + item.quantity),
    new Map<string, number>(),
  );

  const lines: CheckoutLine[] = [];
  for (const [productId, quantity] of quantities) {
    const product = productsById.get(productId);
    if (product === undefined || !product.isActive) {
      return { ok: false, error: `Product ${productId} is not available` };
    }
    if (product.producerId !== input.producerId) {
      return { ok: false, error: `Product ${product.name} belongs to another producer` };
    }
    if (product.stock < quantity) {
      return { ok: false, error: `Not enough stock for ${product.name}` };
    }
    lines.push({ productId, productName: product.name, unitPrice: product.price, quantity });
  }

  const totalCents = lines.reduce(
    (sum, line) => sum + Math.round(Number(line.unitPrice) * 100) * line.quantity,
    0,
  );
  return { ok: true, lines, total: totalCents / 100 };
};

export const formatAddress = (address: {
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
  zipCode: string;
}) =>
  [
    `${address.street}, ${address.number}`,
    address.complement,
    address.district,
    `${address.city}/${address.state}`,
    `CEP ${address.zipCode}`,
  ]
    .filter(Boolean)
    .join(" - ");
