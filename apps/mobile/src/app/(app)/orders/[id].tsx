import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, Chip, Divider, List, Text } from "react-native-paper";

import { ErrorState, Loading } from "@/components/states";
import { formatCurrency, formatDate, orderStatusLabels, paymentMethodLabels } from "@/lib/format";
import { useMyOrder } from "@/lib/queries";

const OrderScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useMyOrder(id);

  if (order.isPending) return <Loading />;
  if (order.isError) return <ErrorState onRetry={order.refetch} />;

  const { data } = order;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.row}>
        <Text variant="titleLarge" style={styles.flex}>
          {data.producer?.name}
        </Text>
        <Chip icon="truck-outline">{orderStatusLabels[data.status]}</Chip>
      </View>
      <Text variant="bodyMedium">Pedido feito em {formatDate(data.createdAt)}</Text>
      <Card mode="contained">
        <Card.Title title="Itens" />
        {data.items.map((item) => (
          <List.Item
            key={item.id}
            title={item.productName}
            description={`${item.quantity} x ${formatCurrency(item.unitPrice)}`}
            right={() => <Text style={styles.price}>{formatCurrency(Number(item.unitPrice) * item.quantity)}</Text>}
          />
        ))}
        <Divider />
        <List.Item title="Total" right={() => <Text variant="titleMedium" style={styles.price}>{formatCurrency(data.total)}</Text>} />
      </Card>
      <Card mode="contained">
        <Card.Title title="Entrega" />
        <Card.Content>
          <Text>{data.deliveryAddress}</Text>
        </Card.Content>
      </Card>
      {data.payment ? (
        <Card mode="contained">
          <Card.Title title="Pagamento" subtitle={`${paymentMethodLabels[data.payment.method]} · ${data.payment.status === "approved" ? "aprovado" : data.payment.status}`} />
          {data.payment.instructions ? (
            <Card.Content>
              <Text selectable variant="bodySmall">
                {data.payment.instructions}
              </Text>
            </Card.Content>
          ) : null}
        </Card>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  price: { alignSelf: "center" },
});

export default OrderScreen;
