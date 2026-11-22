import { router, Stack, useLocalSearchParams } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";
import { Avatar, Button, Snackbar, Text } from "react-native-paper";
import { useState } from "react";

import { ProductCard } from "@/components/ProductCard";
import { EmptyState, ErrorState, Loading } from "@/components/states";
import { cartTotal, useCart } from "@/contexts/cart";
import { formatCurrency } from "@/lib/format";
import { useProducer, useProducts } from "@/lib/queries";

const ProducerScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const producer = useProducer(id);
  const products = useProducts({ producerId: id });
  const { cart, add } = useCart();
  const [message, setMessage] = useState<string | null>(null);

  if (producer.isPending || products.isPending) return <Loading />;
  if (producer.isError || products.isError) return <ErrorState onRetry={() => { producer.refetch(); products.refetch(); }} />;

  const hasCartFromThisProducer = cart.producerId === id && cart.items.length > 0;

  return (
    <View style={styles.flex}>
      <Stack.Screen options={{ title: producer.data.name }} />
      <FlatList
        data={products.data.data}
        keyExtractor={(product) => product.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <Avatar.Icon size={64} icon="storefront-outline" />
            <View style={styles.flex}>
              <Text variant="titleLarge">{producer.data.name}</Text>
              <Text variant="bodyMedium">{[producer.data.city, producer.data.state].filter(Boolean).join("/")}</Text>
              {producer.data.bio ? <Text variant="bodySmall">{producer.data.bio}</Text> : null}
            </View>
          </View>
        }
        ListEmptyComponent={<EmptyState icon="sprout-outline" message="Este produtor ainda não tem produtos." />}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => router.push(`/products/${item.id}`)}
            onAdd={() => {
              if (cart.producerId !== null && cart.producerId !== item.producerId) {
                setMessage("Carrinho reiniciado: cada pedido é de um único produtor.");
              }
              add(item, 1);
            }}
          />
        )}
      />
      {hasCartFromThisProducer ? (
        <Button mode="contained" icon="cart" style={styles.cartButton} onPress={() => router.push("/cart")}>
          Ver carrinho · {formatCurrency(cartTotal(cart))}
        </Button>
      ) : null}
      <Snackbar visible={message !== null} onDismiss={() => setMessage(null)} duration={3000}>
        {message}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: "row", gap: 16, padding: 16, alignItems: "center" },
  cartButton: { margin: 16 },
});

export default ProducerScreen;
