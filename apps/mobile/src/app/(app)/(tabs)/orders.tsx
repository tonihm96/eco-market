import { router } from "expo-router";
import { FlatList } from "react-native";

import { OrderCard } from "@/components/OrderCard";
import { EmptyState, ErrorState, Loading } from "@/components/states";
import { useMyOrders } from "@/lib/queries";

const MyOrders = () => {
  const orders = useMyOrders();

  if (orders.isPending) return <Loading />;
  if (orders.isError) return <ErrorState onRetry={orders.refetch} />;

  return (
    <FlatList
      data={orders.data.data}
      keyExtractor={(order) => order.id}
      onRefresh={orders.refetch}
      refreshing={orders.isRefetching}
      contentContainerStyle={{ paddingVertical: 8, flexGrow: 1 }}
      ListEmptyComponent={<EmptyState icon="receipt-text-outline" message="Você ainda não fez pedidos." />}
      renderItem={({ item }) => (
        <OrderCard order={item} title={item.producer?.name ?? "Pedido"} onPress={() => router.push(`/orders/${item.id}`)} />
      )}
    />
  );
};

export default MyOrders;
