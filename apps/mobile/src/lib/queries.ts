import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  Address,
  AddressInput,
  CheckoutInput,
  Order,
  OrderStatus,
  Paginated,
  Producer,
  ProducerInput,
  Product,
  ProductCategory,
  ProductInput,
} from "@eco-market/shared";

import { api } from "./api";

export const useCategories = () =>
  useQuery({ queryKey: ["categories"], queryFn: () => api<ProductCategory[]>("/categories") });

export const useProducers = (categoryId?: string, q?: string) =>
  useQuery({
    queryKey: ["producers", categoryId, q],
    queryFn: () => api<Paginated<Producer>>("/producers", { query: { categoryId, q, pageSize: 50 } }),
  });

export const useProducer = (id: string) =>
  useQuery({ queryKey: ["producer", id], queryFn: () => api<Producer>(`/producers/${id}`) });

export const useProducts = (filters: { producerId?: string; categoryId?: string; q?: string }) =>
  useQuery({
    queryKey: ["products", filters],
    queryFn: () => api<Paginated<Product>>("/products", { query: { ...filters, pageSize: 100 } }),
  });

export const useProduct = (id: string) =>
  useQuery({
    queryKey: ["product", id],
    queryFn: () => api<Product & { producer: Producer; category: ProductCategory }>(`/products/${id}`),
  });

export const useAddresses = () =>
  useQuery({ queryKey: ["addresses"], queryFn: () => api<Address[]>("/me/addresses") });

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddressInput) => api<Address>("/me/addresses", { method: "POST", body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["addresses"] }),
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/me/addresses/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["addresses"] }),
  });
};

export const useMyOrders = () =>
  useQuery({
    queryKey: ["my-orders"],
    queryFn: () => api<Paginated<Order>>("/me/orders", { query: { pageSize: 50 } }),
  });

export const useMyOrder = (id: string) =>
  useQuery({ queryKey: ["my-order", id], queryFn: () => api<Order>(`/me/orders/${id}`) });

export const useCheckout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CheckoutInput) => api<Order>("/checkout", { method: "POST", body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

// Producer back office
export const useProducerProfile = () =>
  useQuery({ queryKey: ["producer-profile"], queryFn: () => api<Producer>("/producer/profile") });

export const useUpdateProducerProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<ProducerInput>) =>
      api<Producer>("/producer/profile", { method: "PATCH", body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["producer-profile"] }),
  });
};

export const useProducerProducts = () =>
  useQuery({
    queryKey: ["producer-products"],
    queryFn: () => api<Paginated<Product>>("/producer/products", { query: { pageSize: 100 } }),
  });

export const useSaveProduct = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) =>
      id === undefined
        ? api<Product>("/producer/products", { method: "POST", body: input })
        : api<Product>(`/producer/products/${id}`, { method: "PATCH", body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["producer-products"] }),
  });
};

export const useDeactivateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/producer/products/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["producer-products"] }),
  });
};

export const useReceivedOrders = () =>
  useQuery({
    queryKey: ["received-orders"],
    queryFn: () => api<Paginated<Order>>("/producer/orders", { query: { pageSize: 50 } }),
  });

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      api<Order>(`/producer/orders/${id}/status`, { method: "PATCH", body: { status } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["received-orders"] }),
  });
};
