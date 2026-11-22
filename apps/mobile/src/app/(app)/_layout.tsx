import { Redirect, Stack } from "expo-router";
import { useTheme } from "react-native-paper";

import { Loading } from "@/components/states";
import { authClient } from "@/lib/auth-client";

// Everything inside (app) requires an authenticated session
const AppLayout = () => {
  const theme = useTheme();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Loading />;
  }
  if (session === null) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="producers/[id]" options={{ title: "Produtor" }} />
      <Stack.Screen name="products/[id]" options={{ title: "Produto" }} />
      <Stack.Screen name="cart" options={{ title: "Carrinho" }} />
      <Stack.Screen name="orders/[id]" options={{ title: "Pedido" }} />
      <Stack.Screen name="addresses/index" options={{ title: "Meus endereços" }} />
      <Stack.Screen name="addresses/new" options={{ title: "Novo endereço" }} />
      <Stack.Screen name="my-products/[id]" options={{ title: "Produto" }} />
      <Stack.Screen name="store" options={{ title: "Minha loja" }} />
    </Stack>
  );
};

export default AppLayout;
