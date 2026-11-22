import type { OrderStatus, PaymentMethod, ProductUnit } from "@eco-market/shared";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const formatCurrency = (value: string | number) => currency.format(Number(value));

export const formatDate = (value: string) =>
  new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

export const unitLabels: Record<ProductUnit, string> = {
  unit: "unidade",
  kg: "kg",
  g: "g",
  l: "litro",
  ml: "ml",
  dozen: "dúzia",
  bundle: "maço",
};

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Aguardando pagamento",
  paid: "Pago",
  preparing: "Em preparo",
  shipped: "Saiu para entrega",
  delivered: "Entregue",
  canceled: "Cancelado",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  pix: "Pix",
  credit_card: "Cartão de crédito",
  boleto: "Boleto",
};

export const nextProducerStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  paid: "preparing",
  preparing: "shipped",
  shipped: "delivered",
};
