import { z } from "zod";

export const userRoles = ["consumer", "producer", "admin"] as const;
export type UserRole = (typeof userRoles)[number];

export const orderStatuses = [
  "pending",
  "paid",
  "preparing",
  "shipped",
  "delivered",
  "canceled",
] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export const paymentMethods = ["pix", "credit_card", "boleto"] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

export const paymentStatuses = ["pending", "approved", "refused"] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];

export const productUnits = ["unit", "kg", "g", "l", "ml", "dozen", "bundle"] as const;
export type ProductUnit = (typeof productUnits)[number];

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export const productCategoryInputSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(500).nullish(),
  imageUrl: z.url().nullish(),
});
export type ProductCategoryInput = z.infer<typeof productCategoryInputSchema>;

export const producerInputSchema = z.object({
  name: z.string().min(2).max(120),
  bio: z.string().max(1000).nullish(),
  phone: z.string().max(30).nullish(),
  imageUrl: z.url().nullish(),
  city: z.string().max(120).nullish(),
  state: z.string().length(2).nullish(),
});
export type ProducerInput = z.infer<typeof producerInputSchema>;

export const productInputSchema = z.object({
  categoryId: z.uuid(),
  name: z.string().min(2).max(120),
  description: z.string().max(2000).nullish(),
  price: z.coerce.number().positive().max(1_000_000),
  unit: z.enum(productUnits),
  stock: z.coerce.number().int().min(0),
  imageUrl: z.url().nullish(),
  isActive: z.boolean().default(true),
});
export type ProductInput = z.infer<typeof productInputSchema>;

export const addressInputSchema = z.object({
  label: z.string().min(1).max(60),
  street: z.string().min(2).max(160),
  number: z.string().min(1).max(20),
  complement: z.string().max(120).nullish(),
  district: z.string().min(2).max(120),
  city: z.string().min(2).max(120),
  state: z.string().length(2),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/),
  isDefault: z.boolean().default(false),
});
export type AddressInput = z.infer<typeof addressInputSchema>;

export const checkoutInputSchema = z.object({
  producerId: z.uuid(),
  addressId: z.uuid(),
  paymentMethod: z.enum(paymentMethods),
  notes: z.string().max(500).nullish(),
  items: z
    .array(
      z.object({
        productId: z.uuid(),
        quantity: z.number().int().min(1).max(999),
      }),
    )
    .min(1),
});
export type CheckoutInput = z.infer<typeof checkoutInputSchema>;

export const orderStatusUpdateSchema = z.object({
  status: z.enum(orderStatuses),
});
export type OrderStatusUpdate = z.infer<typeof orderStatusUpdateSchema>;

export const userRoleUpdateSchema = z.object({
  role: z.enum(userRoles),
});
export type UserRoleUpdate = z.infer<typeof userRoleUpdateSchema>;

export type Paginated<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type ProductCategory = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
};

export type Producer = {
  id: string;
  userId: string;
  name: string;
  bio: string | null;
  phone: string | null;
  imageUrl: string | null;
  city: string | null;
  state: string | null;
};

export type Product = {
  id: string;
  producerId: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: string;
  unit: ProductUnit;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
};

export type Address = AddressInput & { id: string; userId: string };

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  unitPrice: string;
  quantity: number;
};

export type Payment = {
  id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: string;
  provider: string;
  providerReference: string | null;
  instructions: string | null;
};

export type Order = {
  id: string;
  userId: string;
  producerId: string;
  status: OrderStatus;
  total: string;
  notes: string | null;
  deliveryAddress: string;
  createdAt: string;
  items: OrderItem[];
  payment: Payment | null;
  producer?: Pick<Producer, "id" | "name">;
  customer?: { id: string; name: string; email: string };
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string | null;
};
