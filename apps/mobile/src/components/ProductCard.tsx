import { StyleSheet } from "react-native";
import { Avatar, Card, IconButton, Text } from "react-native-paper";

import type { Product } from "@eco-market/shared";

import { formatCurrency, unitLabels } from "@/lib/format";

type Props = { product: Product; onPress: () => void; onAdd?: () => void };

export const ProductCard = ({ product, onPress, onAdd }: Props) => (
  <Card mode="contained" style={styles.card} onPress={onPress}>
    <Card.Title
      title={product.name}
      subtitle={`${formatCurrency(product.price)} / ${unitLabels[product.unit]}`}
      subtitleStyle={styles.price}
      left={(props) =>
        product.imageUrl ? (
          <Avatar.Image {...props} source={{ uri: product.imageUrl }} />
        ) : (
          <Avatar.Icon {...props} icon="sprout" />
        )
      }
      right={(props) =>
        onAdd && product.stock > 0 ? (
          <IconButton {...props} icon="cart-plus" mode="contained" onPress={onAdd} />
        ) : (
          <Text style={styles.stock}>{product.stock > 0 ? `${product.stock} em estoque` : "Esgotado"}</Text>
        )
      }
    />
  </Card>
);

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginVertical: 6 },
  price: { fontWeight: "600" },
  stock: { marginRight: 16 },
});
