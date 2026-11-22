import { router } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";
import { FAB, IconButton, List } from "react-native-paper";

import { EmptyState, ErrorState, Loading } from "@/components/states";
import { useAddresses, useDeleteAddress } from "@/lib/queries";

const Addresses = () => {
  const addresses = useAddresses();
  const remove = useDeleteAddress();

  if (addresses.isPending) return <Loading />;
  if (addresses.isError) return <ErrorState onRetry={addresses.refetch} />;

  return (
    <View style={styles.flex}>
      <FlatList
        data={addresses.data}
        keyExtractor={(address) => address.id}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={<EmptyState icon="map-marker-off-outline" message="Nenhum endereço cadastrado." />}
        renderItem={({ item }) => (
          <List.Item
            title={`${item.label}${item.isDefault ? " (principal)" : ""}`}
            description={`${item.street}, ${item.number} - ${item.district}, ${item.city}/${item.state}`}
            left={(props) => <List.Icon {...props} icon={item.isDefault ? "map-marker-star" : "map-marker-outline"} />}
            right={() => <IconButton icon="delete-outline" onPress={() => remove.mutate(item.id)} />}
          />
        )}
      />
      <FAB icon="plus" style={styles.fab} onPress={() => router.push("/addresses/new")} />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fab: { position: "absolute", right: 16, bottom: 16 },
});

export default Addresses;
