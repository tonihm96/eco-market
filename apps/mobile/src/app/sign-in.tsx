import { Link, router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, HelperText, Icon, Text, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/lib/auth-client";

const SignIn = () => {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    const { error: signInError } = await authClient.signIn.email({ email: email.trim(), password });
    setLoading(false);
    if (signInError) {
      setError(
        signInError.code === "EMAIL_NOT_VERIFIED"
          ? "Confirme seu e-mail antes de entrar."
          : "E-mail ou senha inválidos.",
      );
      return;
    }
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.flex}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.logo}>
            <Icon source="sprout" size={72} color={theme.colors.primary} />
          </View>
          <Text variant="headlineMedium" style={styles.title}>
            Eco Market
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Produtos locais, direto do produtor.
          </Text>
          <TextInput
            mode="outlined"
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <TextInput
            mode="outlined"
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword((value) => !value)}
              />
            }
          />
          <HelperText type="error" visible={error !== null}>
            {error}
          </HelperText>
          <Button mode="contained" onPress={onSubmit} loading={loading} disabled={loading || !email || !password}>
            Entrar
          </Button>
          <Link href="/sign-up" asChild>
            <Button mode="text">Criar conta</Button>
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: "center", padding: 24, gap: 8, alignItems: "stretch" },
  logo: { alignItems: "center" },
  title: { textAlign: "center", fontWeight: "700" },
  subtitle: { textAlign: "center", marginBottom: 16 },
});

export default SignIn;
