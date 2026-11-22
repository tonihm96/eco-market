import { Redirect, router, Tabs } from "expo-router";
import { useState } from "react";
import { FlatList, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Badge, Card, Chip, IconButton, Searchbar, Text } from "react-native-paper";

import { EmptyState, ErrorState, Loading } from "@/components/states";
import { useCart } from "@/contexts/cart";
import { authClient } from "@/lib/auth-client";
import { useCategories, useProducers } from "@/lib/queries";

const CartButton = () => {
  const { cart } = useCart();
  const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <View>
      <IconButton icon="cart-outline" onPress={() => router.push("/cart")} />
      {count > 0 ? <Badge style={styles.badge}>{count}</Badge> : null}
    </View>
  );
};

const Home = () => {
  const { data: session } = authClient.useSession();
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const categories = useCategories();
  const producers = useProducers(categoryId, search.trim() || undefined);

  if (session?.user.role === "producer") {
    return <Redirect href="/products" />;
  }

  return (
    <View style={styles.flex}>
      <Tabs.Screen options={{ headerRight: () => <CartButton /> }} />
      <Searchbar placeholder="Buscar produtores" value={search} onChangeText={setSearch} style={styles.search} />
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip selected={categoryId === undefined} onPress={() => setCategoryId(undefined)}>
            Todos
          </Chip>
          {categories.data?.map((category) => (
            <Chip
              key={category.id}
              selected={categoryId === category.id}
              onPress={() => setCategoryId(categoryId === category.id ? undefined : category.id)}
            >
              {category.name}
            </Chip>
          ))}
        </ScrollView>
      </View>
      {producers.isPending ? (
        <Loading />
      ) : producers.isError ? (
        <ErrorState onRetry={producers.refetch} />
      ) : (
        <FlatList
          data={producers.data.data}
          keyExtractor={(producer) => producer.id}
          onRefresh={producers.refetch}
          refreshing={producers.isRefetching}
          ListEmptyComponent={<EmptyState icon="store-off-outline" message="Nenhum produtor encontrado." />}
          renderItem={({ item }) => (
            <Card mode="contained" style={styles.card} onPress={() => router.push(`/producers/${item.id}`)}>
              <Card.Title
                title={item.name}
                subtitle={[item.city, item.state].filter(Boolean).join("/") || "Produtor local"}
                left={(props) =>
                  item.imageUrl ? (
                    <Avatar.Image {...props} source={{ uri: item.imageUrl }} />
                  ) : (
                    <Avatar.Icon {...props} icon="storefront-outline" />
                  )
                }
              />
              {item.bio ? (
                <Card.Content>
                  <Text variant="bodySmall">{item.bio}</Text>
                </Card.Content>
              ) : null}
            </Card>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  search: { margin: 16, marginBottom: 8 },
  chips: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  card: { marginHorizontal: 16, marginVertical: 6 },
  badge: { position: "absolute", top: 4, right: 4 },
});

export default Home;
