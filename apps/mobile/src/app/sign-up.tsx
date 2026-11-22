import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Appbar, Button, HelperText, SegmentedButtons, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/lib/auth-client";

type Role = "consumer" | "producer";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("consumer");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    const { error: signUpError } = await authClient.signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      callbackURL: "ecomarket://",
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message ?? "Não foi possível criar a conta.");
      return;
    }
    setDone(true);
  };

  return (
    <SafeAreaView style={styles.flex} edges={["bottom"]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Criar conta" />
      </Appbar.Header>
      {done ? (
        <ScrollView contentContainerStyle={styles.container}>
          <Text variant="titleLarge">Quase lá!</Text>
          <Text variant="bodyLarge">
            Enviamos um link de confirmação para {email}. Confirme seu e-mail e depois faça login.
          </Text>
          <Button mode="contained" onPress={() => router.replace("/sign-in")}>
            Ir para o login
          </Button>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text variant="titleMedium">Como você vai usar o Eco Market?</Text>
          <SegmentedButtons
            value={role}
            onValueChange={(value) => setRole(value as Role)}
            buttons={[
              { value: "consumer", label: "Quero comprar", icon: "basket-outline" },
              { value: "producer", label: "Quero vender", icon: "storefront-outline" },
            ]}
          />
          <TextInput
            mode="outlined"
            label={role === "producer" ? "Nome do produtor ou sítio" : "Nome"}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            mode="outlined"
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            mode="outlined"
            label="Senha (mínimo 8 caracteres)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <HelperText type="error" visible={error !== null}>
            {error}
          </HelperText>
          <Button
            mode="contained"
            onPress={onSubmit}
            loading={loading}
            disabled={loading || name.length < 2 || !email || password.length < 8}
          >
            Cadastrar
          </Button>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 24, gap: 12 },
});

export default SignUp;
