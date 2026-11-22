import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Chip, HelperText, Switch, Text, TextInput } from "react-native-paper";

import { productInputSchema, productUnits, type ProductUnit } from "@eco-market/shared";

import { Loading } from "@/components/states";
import { unitLabels } from "@/lib/format";
import { useCategories, useDeactivateProduct, useProducerProducts, useSaveProduct } from "@/lib/queries";

type FormState = {
  name: string;
  description: string;
  price: string;
  stock: string;
  unit: ProductUnit;
  categoryId: string;
  imageUrl: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  price: "",
  stock: "0",
  unit: "unit",
  categoryId: "",
  imageUrl: "",
  isActive: true,
};

const ProductForm = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === "new";
  const categories = useCategories();
  const products = useProducerProducts();
  const save = useSaveProduct(isNew ? undefined : id);
  const deactivate = useDeactivateProduct();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const existing = products.data?.data.find((product) => product.id === id);

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        description: existing.description ?? "",
        price: Number(existing.price).toFixed(2),
        stock: String(existing.stock),
        unit: existing.unit,
        categoryId: existing.categoryId,
        imageUrl: existing.imageUrl ?? "",
        isActive: existing.isActive,
      });
    }
  }, [existing]);

  if (categories.isPending || (!isNew && products.isPending)) return <Loading />;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const onSave = () => {
    const parsed = productInputSchema.safeParse({
      ...form,
      price: form.price.replace(",", "."),
      description: form.description || null,
      imageUrl: form.imageUrl || null,
    });
    if (!parsed.success) {
      setError("Preencha nome, categoria, preço e estoque corretamente.");
      return;
    }
    save.mutate(parsed.data, { onSuccess: () => router.back() });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: isNew ? "Novo produto" : "Editar produto" }} />
      <TextInput mode="outlined" label="Nome" value={form.name} onChangeText={(v) => update("name", v)} />
      <TextInput
        mode="outlined"
        label="Descrição"
        value={form.description}
        multiline
        onChangeText={(v) => update("description", v)}
      />
      <View style={styles.row}>
        <TextInput
          mode="outlined"
          label="Preço (R$)"
          style={styles.flex}
          keyboardType="decimal-pad"
          value={form.price}
          onChangeText={(v) => update("price", v)}
        />
        <TextInput
          mode="outlined"
          label="Estoque"
          style={styles.flex}
          keyboardType="number-pad"
          value={form.stock}
          onChangeText={(v) => update("stock", v)}
        />
      </View>
      <Text variant="labelLarge">Unidade</Text>
      <View style={styles.chips}>
        {productUnits.map((unit) => (
          <Chip key={unit} selected={form.unit === unit} onPress={() => update("unit", unit)}>
            {unitLabels[unit]}
          </Chip>
        ))}
      </View>
      <Text variant="labelLarge">Categoria</Text>
      <View style={styles.chips}>
        {categories.data?.map((category) => (
          <Chip key={category.id} selected={form.categoryId === category.id} onPress={() => update("categoryId", category.id)}>
            {category.name}
          </Chip>
        ))}
      </View>
      <TextInput
        mode="outlined"
        label="URL da imagem (opcional)"
        autoCapitalize="none"
        value={form.imageUrl}
        onChangeText={(v) => update("imageUrl", v)}
      />
      <View style={styles.row}>
        <Text variant="bodyLarge" style={styles.flex}>
          Visível para os clientes
        </Text>
        <Switch value={form.isActive} onValueChange={(v) => update("isActive", v)} />
      </View>
      <HelperText type="error" visible={error !== null || save.isError}>
        {error ?? "Não foi possível salvar o produto."}
      </HelperText>
      <Button mode="contained" onPress={onSave} loading={save.isPending}>
        Salvar
      </Button>
      {!isNew && existing?.isActive ? (
        <Button
          mode="text"
          icon="eye-off-outline"
          onPress={() => deactivate.mutate(id, { onSuccess: () => router.back() })}
        >
          Desativar produto
        </Button>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  row: { flexDirection: "row", gap: 8, alignItems: "center" },
  flex: { flex: 1 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});

export default ProductForm;
