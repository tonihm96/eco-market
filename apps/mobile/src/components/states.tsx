import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Icon, Text } from "react-native-paper";

export const Loading = () => (
  <View style={styles.center}>
    <ActivityIndicator size="large" />
  </View>
);

export const ErrorState = ({ onRetry }: { onRetry?: () => void }) => (
  <View style={styles.center}>
    <Icon source="alert-circle-outline" size={48} />
    <Text variant="bodyLarge">Não foi possível carregar os dados.</Text>
    {onRetry ? <Button onPress={onRetry}>Tentar novamente</Button> : null}
  </View>
);

export const EmptyState = ({ icon, message }: { icon: string; message: string }) => (
  <View style={styles.center}>
    <Icon source={icon} size={48} />
    <Text variant="bodyLarge" style={styles.text}>
      {message}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  text: { textAlign: "center" },
});
