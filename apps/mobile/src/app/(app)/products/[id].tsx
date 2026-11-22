import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, Chip, IconButton, Text } from "react-native-paper";

import { ErrorState, Loading } from "@/components/states";
import { useCart } from "@/contexts/cart";
import { formatCurrency, unitLabels } from "@/lib/format";
import { useProduct } from "@/lib/queries";

const ProductScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = useProduct(id);
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (product.isPending) return <Loading />;
  if (product.isError) return <ErrorState onRetry={product.refetch} />;

  const { data } = product;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: data.name }} />
      {data.imageUrl ? (
        <Image source={{ uri: data.imageUrl }} style={styles.image} />
      ) : (
        <Avatar.Icon size={120} icon="sprout" style={styles.center} />
      )}
      <Text variant="headlineSmall">{data.name}</Text>
      <View style={styles.row}>
        <Chip icon="tag-outline">{data.category.name}</Chip>
        <Chip icon="storefront-outline" onPress={() => router.push(`/producers/${data.producerId}`)}>
          {data.producer.name}
        </Chip>
      </View>
      <Text variant="titleLarge">
        {formatCurrency(data.price)} / {unitLabels[data.unit]}
      </Text>
      {data.description ? <Text variant="bodyLarge">{data.description}</Text> : null}
      <Text variant="bodyMedium">{data.stock > 0 ? `${data.stock} disponíveis` : "Esgotado"}</Text>
      {data.stock > 0 ? (
        <>
          <View style={[styles.row, styles.center]}>
            <IconButton icon="minus" mode="outlined" onPress={() => setQuantity((q) => Math.max(1, q - 1))} />
            <Text variant="titleLarge">{quantity}</Text>
            <IconButton icon="plus" mode="outlined" onPress={() => setQuantity((q) => Math.min(data.stock, q + 1))} />
          </View>
          <Button
            mode="contained"
            icon="cart-plus"
            onPress={() => {
              add(data, quantity);
              router.back();
            }}
          >
            Adicionar · {formatCurrency(Number(data.price) * quantity)}
          </Button>
        </>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  image: { width: "100%", aspectRatio: 4 / 3, borderRadius: 16 },
  row: { flexDirection: "row", gap: 8, alignItems: "center", flexWrap: "wrap" },
  center: { alignSelf: "center" },
});

export default ProductScreen;
