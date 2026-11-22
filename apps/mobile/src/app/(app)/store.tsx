import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";

import { Loading } from "@/components/states";
import { useProducerProfile, useUpdateProducerProfile } from "@/lib/queries";

const Store = () => {
  const profile = useProducerProfile();
  const update = useUpdateProducerProfile();
  const [form, setForm] = useState({ name: "", bio: "", phone: "", city: "", state: "" });

  useEffect(() => {
    if (profile.data) {
      setForm({
        name: profile.data.name,
        bio: profile.data.bio ?? "",
        phone: profile.data.phone ?? "",
        city: profile.data.city ?? "",
        state: profile.data.state ?? "",
      });
    }
  }, [profile.data]);

  if (profile.isPending) return <Loading />;

  const onSave = () =>
    update.mutate(
      {
        name: form.name,
        bio: form.bio || null,
        phone: form.phone || null,
        city: form.city || null,
        state: form.state ? form.state.toUpperCase() : null,
      },
      { onSuccess: () => router.back() },
    );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput mode="outlined" label="Nome da loja" value={form.name} onChangeText={(name) => setForm({ ...form, name })} />
      <TextInput mode="outlined" label="Sobre" multiline value={form.bio} onChangeText={(bio) => setForm({ ...form, bio })} />
      <TextInput mode="outlined" label="Telefone" keyboardType="phone-pad" value={form.phone} onChangeText={(phone) => setForm({ ...form, phone })} />
      <TextInput mode="outlined" label="Cidade" value={form.city} onChangeText={(city) => setForm({ ...form, city })} />
      <TextInput mode="outlined" label="UF" maxLength={2} autoCapitalize="characters" value={form.state} onChangeText={(state) => setForm({ ...form, state })} />
      <HelperText type="error" visible={update.isError}>
        Não foi possível salvar.
      </HelperText>
      <Button mode="contained" onPress={onSave} loading={update.isPending}>
        Salvar
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({ container: { padding: 16, gap: 8 } });

export default Store;
