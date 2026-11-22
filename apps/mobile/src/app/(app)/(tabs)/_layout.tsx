import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import type { ColorValue } from "react-native";
import { useTheme } from "react-native-paper";

import { authClient } from "@/lib/auth-client";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const tabIcon =
  (name: IconName) =>
  ({ color, size }: { color: ColorValue; size: number }) => <MaterialCommunityIcons name={name} color={color as string} size={size} />;

// Tabs change according to the user's role
const TabsLayout = () => {
  const theme = useTheme();
  const { data: session } = authClient.useSession();
  const isProducer = session?.user.role === "producer";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarStyle: { backgroundColor: theme.colors.surface },
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Início", tabBarIcon: tabIcon("home-outline"), href: isProducer ? null : undefined }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: "Meus pedidos", tabBarIcon: tabIcon("receipt-text-outline"), href: isProducer ? null : undefined }}
      />
      <Tabs.Screen
        name="products"
        options={{ title: "Meus produtos", tabBarIcon: tabIcon("sprout-outline"), href: isProducer ? undefined : null }}
      />
      <Tabs.Screen
        name="received"
        options={{ title: "Pedidos recebidos", tabBarIcon: tabIcon("inbox-arrow-down-outline"), href: isProducer ? undefined : null }}
      />
      <Tabs.Screen name="profile" options={{ title: "Perfil", tabBarIcon: tabIcon("account-outline") }} />
    </Tabs>
  );
};

export default TabsLayout;
