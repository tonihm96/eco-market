import type { OrderStatus, UserRole } from "@eco-market/shared";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const formatCurrency = (value: string | number) => currency.format(Number(value));
export const formatDate = (value: string) =>
  new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

export const roleLabels: Record<UserRole, string> = {
  consumer: "Consumidor",
  producer: "Produtor",
  admin: "Administrador",
};

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Aguardando pagamento",
  paid: "Pago",
  preparing: "Em preparo",
  shipped: "Saiu para entrega",
  delivered: "Entregue",
  canceled: "Cancelado",
};
