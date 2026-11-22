import { router } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";
import { Avatar, Button, List, Text } from "react-native-paper";

import { authClient } from "@/lib/auth-client";

const roleLabels: Record<string, string> = { consumer: "Consumidor", producer: "Produtor", admin: "Administrador" };

const Profile = () => {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const isProducer = user?.role === "producer";

  const onSignOut = async () => {
    await authClient.signOut();
    router.replace("/sign-in");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Avatar.Text size={72} label={(user?.name ?? "?").slice(0, 2).toUpperCase()} style={styles.center} />
      <Text variant="titleLarge" style={styles.centerText}>
        {user?.name}
      </Text>
      <Text variant="bodyMedium" style={styles.centerText}>
        {user?.email} · {roleLabels[user?.role ?? "consumer"]}
      </Text>
      <List.Section>
        {isProducer ? (
          <List.Item
            title="Minha loja"
            description="Nome, descrição e cidade exibidos aos clientes"
            left={(props) => <List.Icon {...props} icon="storefront-outline" />}
            onPress={() => router.push("/store")}
          />
        ) : (
          <List.Item
            title="Meus endereços"
            left={(props) => <List.Icon {...props} icon="map-marker-outline" />}
            onPress={() => router.push("/addresses")}
          />
        )}
      </List.Section>
      <Button mode="outlined" icon="logout" onPress={onSignOut}>
        Sair
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 24, gap: 8 },
  center: { alignSelf: "center" },
  centerText: { textAlign: "center" },
});

export default Profile;
