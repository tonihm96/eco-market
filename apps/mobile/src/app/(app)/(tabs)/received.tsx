import { FlatList } from "react-native";
import { Button, Text } from "react-native-paper";

import { OrderCard } from "@/components/OrderCard";
import { EmptyState, ErrorState, Loading } from "@/components/states";
import { nextProducerStatus, orderStatusLabels } from "@/lib/format";
import { useReceivedOrders, useUpdateOrderStatus } from "@/lib/queries";

const ReceivedOrders = () => {
  const orders = useReceivedOrders();
  const updateStatus = useUpdateOrderStatus();

  if (orders.isPending) return <Loading />;
  if (orders.isError) return <ErrorState onRetry={orders.refetch} />;

  return (
    <FlatList
      data={orders.data.data}
      keyExtractor={(order) => order.id}
      onRefresh={orders.refetch}
      refreshing={orders.isRefetching}
      contentContainerStyle={{ paddingVertical: 8, flexGrow: 1 }}
      ListEmptyComponent={<EmptyState icon="inbox-outline" message="Nenhum pedido recebido ainda." />}
      renderItem={({ item }) => {
        const next = nextProducerStatus[item.status];
        return (
          <OrderCard order={item} title={item.customer?.name ?? "Cliente"}>
            <Text variant="bodySmall" style={{ flex: 1 }} numberOfLines={2}>
              {item.deliveryAddress}
            </Text>
            {next ? (
              <Button
                mode="contained-tonal"
                loading={updateStatus.isPending && updateStatus.variables?.id === item.id}
                onPress={() => updateStatus.mutate({ id: item.id, status: next })}
              >
                {orderStatusLabels[next]}
              </Button>
            ) : null}
          </OrderCard>
        );
      }}
    />
  );
};

export default ReceivedOrders;
