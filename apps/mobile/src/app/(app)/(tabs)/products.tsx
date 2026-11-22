import { router } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";
import { Chip, FAB } from "react-native-paper";

import { ProductCard } from "@/components/ProductCard";
import { EmptyState, ErrorState, Loading } from "@/components/states";
import { useProducerProducts } from "@/lib/queries";

const ProducerProducts = () => {
  const products = useProducerProducts();

  if (products.isPending) return <Loading />;
  if (products.isError) return <ErrorState onRetry={products.refetch} />;

  return (
    <View style={styles.flex}>
      <FlatList
        data={products.data.data}
        keyExtractor={(product) => product.id}
        onRefresh={products.refetch}
        refreshing={products.isRefetching}
        contentContainerStyle={{ paddingVertical: 8, paddingBottom: 96, flexGrow: 1 }}
        ListEmptyComponent={<EmptyState icon="sprout-outline" message="Cadastre seu primeiro produto." />}
        renderItem={({ item }) => (
          <View style={!item.isActive && styles.inactive}>
            <ProductCard product={item} onPress={() => router.push(`/my-products/${item.id}`)} />
            {!item.isActive ? <Chip compact style={styles.chip}>Inativo</Chip> : null}
          </View>
        )}
      />
      <FAB icon="plus" label="Produto" style={styles.fab} onPress={() => router.push("/my-products/new")} />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fab: { position: "absolute", right: 16, bottom: 16 },
  inactive: { opacity: 0.6 },
  chip: { alignSelf: "flex-start", marginLeft: 16 },
});

export default ProducerProducts;
