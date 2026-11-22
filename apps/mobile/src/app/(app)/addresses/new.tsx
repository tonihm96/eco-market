import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Checkbox, HelperText, TextInput } from "react-native-paper";

import { addressInputSchema, type AddressInput } from "@eco-market/shared";

import { useCreateAddress } from "@/lib/queries";

type Field = Exclude<keyof AddressInput, "isDefault">;

const fields: { key: Field; label: string; keyboardType?: "numeric" }[] = [
  { key: "label", label: "Identificação (ex.: Casa)" },
  { key: "zipCode", label: "CEP", keyboardType: "numeric" },
  { key: "street", label: "Rua" },
  { key: "number", label: "Número" },
  { key: "complement", label: "Complemento" },
  { key: "district", label: "Bairro" },
  { key: "city", label: "Cidade" },
  { key: "state", label: "UF" },
];

const NewAddress = () => {
  const create = useCreateAddress();
  const [values, setValues] = useState<Record<Field, string>>({
    label: "",
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "",
  });
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSave = () => {
    const parsed = addressInputSchema.safeParse({
      ...values,
      state: values.state.toUpperCase(),
      complement: values.complement || null,
      isDefault,
    });
    if (!parsed.success) {
      setError("Confira os campos: CEP no formato 00000-000 e UF com 2 letras.");
      return;
    }
    create.mutate(parsed.data, { onSuccess: () => router.back() });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {fields.map((field) => (
        <TextInput
          key={field.key}
          mode="outlined"
          label={field.label}
          value={values[field.key]}
          keyboardType={field.keyboardType}
          autoCapitalize={field.key === "state" ? "characters" : "sentences"}
          maxLength={field.key === "state" ? 2 : undefined}
          onChangeText={(text) => setValues((current) => ({ ...current, [field.key]: text }))}
        />
      ))}
      <Checkbox.Item label="Endereço principal" status={isDefault ? "checked" : "unchecked"} onPress={() => setIsDefault((v) => !v)} />
      <HelperText type="error" visible={error !== null || create.isError}>
        {error ?? "Não foi possível salvar o endereço."}
      </HelperText>
      <Button mode="contained" onPress={onSave} loading={create.isPending}>
        Salvar
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({ container: { padding: 16, gap: 8 } });

export default NewAddress;
