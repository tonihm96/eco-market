import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Divider, HelperText, IconButton, RadioButton, Text } from "react-native-paper";

import { paymentMethods, type PaymentMethod } from "@eco-market/shared";

import { EmptyState } from "@/components/states";
import { cartTotal, useCart } from "@/contexts/cart";
import { formatCurrency, paymentMethodLabels } from "@/lib/format";
import { useAddresses, useCheckout } from "@/lib/queries";

const CartScreen = () => {
  const { cart, setQuantity, clear } = useCart();
  const addresses = useAddresses();
  const checkout = useCheckout();
  const [addressId, setAddressId] = useState<string | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");

  useEffect(() => {
    if (addressId === undefined && addresses.data?.length) {
      setAddressId((addresses.data.find((address) => address.isDefault) ?? addresses.data[0]).id);
    }
  }, [addresses.data, addressId]);

  if (cart.items.length === 0 || cart.producerId === null) {
    return <EmptyState icon="cart-off" message="Seu carrinho está vazio." />;
  }

  const onConfirm = () => {
    if (addressId === undefined || cart.producerId === null) return;
    checkout.mutate(
      {
        producerId: cart.producerId,
        addressId,
        paymentMethod,
        items: cart.items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
      },
      {
        onSuccess: (order) => {
          clear();
          router.replace(`/orders/${order.id}`);
        },
      },
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card mode="contained">
        <Card.Title title="Itens" />
        <Card.Content>
          {cart.items.map((item) => (
            <View key={item.product.id} style={styles.item}>
              <View style={styles.flex}>
                <Text variant="bodyLarge">{item.product.name}</Text>
                <Text variant="bodySmall">{formatCurrency(item.product.price)} cada</Text>
              </View>
              <IconButton icon="minus" size={18} onPress={() => setQuantity(item.product.id, item.quantity - 1)} />
              <Text variant="titleMedium">{item.quantity}</Text>
              <IconButton
                icon="plus"
                size={18}
                disabled={item.quantity >= item.product.stock}
                onPress={() => setQuantity(item.product.id, item.quantity + 1)}
              />
            </View>
          ))}
          <Divider style={styles.divider} />
          <View style={styles.item}>
            <Text variant="titleMedium" style={styles.flex}>
              Total
            </Text>
            <Text variant="titleLarge">{formatCurrency(cartTotal(cart))}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card mode="contained">
        <Card.Title
          title="Entrega"
          right={(props) => <IconButton {...props} icon="plus" onPress={() => router.push("/addresses/new")} />}
        />
        <Card.Content>
          {addresses.data?.length ? (
            <RadioButton.Group value={addressId ?? ""} onValueChange={setAddressId}>
              {addresses.data.map((address) => (
                <RadioButton.Item
                  key={address.id}
                  value={address.id}
                  label={`${address.label}: ${address.street}, ${address.number} - ${address.city}/${address.state}`}
                />
              ))}
            </RadioButton.Group>
          ) : (
            <Text>Cadastre um endereço para continuar.</Text>
          )}
        </Card.Content>
      </Card>

      <Card mode="contained">
        <Card.Title title="Pagamento" />
        <Card.Content>
          <RadioButton.Group value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
            {paymentMethods.map((method) => (
              <RadioButton.Item key={method} value={method} label={paymentMethodLabels[method]} />
            ))}
          </RadioButton.Group>
          <HelperText type="info">Ambiente de demonstração: o pagamento é simulado.</HelperText>
        </Card.Content>
      </Card>

      <HelperText type="error" visible={checkout.isError}>
        {checkout.error?.message ?? "Não foi possível concluir o pedido."}
      </HelperText>
      <Button
        mode="contained"
        icon="check"
        onPress={onConfirm}
        loading={checkout.isPending}
        disabled={checkout.isPending || addressId === undefined}
      >
        Confirmar pedido
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  flex: { flex: 1 },
  item: { flexDirection: "row", alignItems: "center" },
  divider: { marginVertical: 8 },
});

export default CartScreen;
