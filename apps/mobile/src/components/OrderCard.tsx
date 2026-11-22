import { StyleSheet, View } from "react-native";
import { Card, Chip, Text } from "react-native-paper";

import type { Order } from "@eco-market/shared";

import { formatCurrency, formatDate, orderStatusLabels } from "@/lib/format";

type Props = { order: Order; title: string; onPress?: () => void; children?: React.ReactNode };

export const OrderCard = ({ order, title, onPress, children }: Props) => (
  <Card mode="contained" style={styles.card} onPress={onPress}>
    <Card.Title title={title} subtitle={formatDate(order.createdAt)} />
    <Card.Content style={styles.content}>
      <View style={styles.row}>
        <Chip compact icon="truck-outline">
          {orderStatusLabels[order.status]}
        </Chip>
        <Text variant="titleMedium">{formatCurrency(order.total)}</Text>
      </View>
      <Text variant="bodyMedium">
        {order.items.map((item) => `${item.quantity}x ${item.productName}`).join(", ")}
      </Text>
    </Card.Content>
    {children ? <Card.Actions>{children}</Card.Actions> : null}
  </Card>
);

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginVertical: 6 },
  content: { gap: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
