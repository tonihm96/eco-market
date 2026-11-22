import { eq, inArray } from "drizzle-orm";

import type { ProductUnit, UserRole } from "@eco-market/shared";

import { auth } from "@/auth/auth";
import database from "@/database/client";
import { addresses, producers, productCategories, products, users } from "@/database/schema";

const DEFAULT_PASSWORD = "ecomarket123";

const seedUsers: { name: string; email: string; role: UserRole }[] = [
  { name: "Administrador", email: "admin@ecomarket.dev", role: "admin" },
  { name: "Sítio Boa Terra", email: "boaterra@ecomarket.dev", role: "producer" },
  { name: "Apiário Serra Verde", email: "serraverde@ecomarket.dev", role: "producer" },
  { name: "Maria Consumidora", email: "maria@ecomarket.dev", role: "consumer" },
];

const seedCategories = [
  { name: "Hortifrúti", description: "Frutas, verduras e legumes frescos" },
  { name: "Laticínios", description: "Queijos, leites e derivados artesanais" },
  { name: "Mel e derivados", description: "Mel, própolis e cera" },
  { name: "Panificados", description: "Pães, cucas e biscoitos caseiros" },
  { name: "Artesanato", description: "Produtos artesanais da região" },
];

type SeedProduct = { name: string; category: string; price: number; unit: ProductUnit; stock: number; description: string };

const seedProducts: Record<string, SeedProduct[]> = {
  "boaterra@ecomarket.dev": [
    { name: "Alface crespa orgânica", category: "Hortifrúti", price: 4.5, unit: "unit", stock: 40, description: "Colhida no dia da entrega." },
    { name: "Tomate cereja", category: "Hortifrúti", price: 12.9, unit: "kg", stock: 25, description: "Cultivo sem agrotóxicos." },
    { name: "Ovos caipiras", category: "Laticínios", price: 15, unit: "dozen", stock: 30, description: "Galinhas criadas soltas." },
    { name: "Queijo colonial", category: "Laticínios", price: 48, unit: "kg", stock: 12, description: "Maturado por 30 dias." },
    { name: "Cuca de banana", category: "Panificados", price: 22, unit: "unit", stock: 8, description: "Receita de família." },
  ],
  "serraverde@ecomarket.dev": [
    { name: "Mel silvestre 500 g", category: "Mel e derivados", price: 32, unit: "unit", stock: 50, description: "Florada nativa da Serra do Mar." },
    { name: "Própolis verde 30 ml", category: "Mel e derivados", price: 28, unit: "unit", stock: 20, description: "Extrato alcoólico." },
    { name: "Vela de cera de abelha", category: "Artesanato", price: 18, unit: "unit", stock: 15, description: "Feita à mão." },
  ],
};

const ensureUser = async ({ name, email, role }: (typeof seedUsers)[number]) => {
  const existing = await database.query.users.findFirst({ where: eq(users.email, email) });
  if (existing === undefined) {
    await auth.api.signUpEmail({ body: { name, email, password: DEFAULT_PASSWORD, role } });
  }
  const [user] = await database
    .update(users)
    .set({ role, emailVerified: true })
    .where(eq(users.email, email))
    .returning();
  if (role === "producer") {
    await database.insert(producers).values({ userId: user.id, name }).onConflictDoNothing();
  }
  return user;
};

const main = async () => {
  const createdUsers = await Promise.all(seedUsers.map(ensureUser));

  await database.insert(productCategories).values(seedCategories).onConflictDoNothing();
  const categories = await database.query.productCategories.findMany({
    where: inArray(
      productCategories.name,
      seedCategories.map((category) => category.name),
    ),
  });
  const categoryIdByName = new Map(categories.map((category) => [category.name, category.id]));

  for (const [email, items] of Object.entries(seedProducts)) {
    const user = createdUsers.find((candidate) => candidate.email === email)!;
    const [producer] = await database
      .update(producers)
      .set({ city: "Joaçaba", state: "SC", bio: "Produtor local cadastrado no Eco Market." })
      .where(eq(producers.userId, user.id))
      .returning();
    const alreadySeeded = await database.$count(products, eq(products.producerId, producer.id));
    if (alreadySeeded > 0) continue;
    await database.insert(products).values(
      items.map(({ category, price, ...item }) => ({
        ...item,
        price: price.toFixed(2),
        producerId: producer.id,
        categoryId: categoryIdByName.get(category)!,
      })),
    );
  }

  const consumer = createdUsers.find((user) => user.role === "consumer")!;
  const hasAddress = await database.$count(addresses, eq(addresses.userId, consumer.id));
  if (hasAddress === 0) {
    await database.insert(addresses).values({
      userId: consumer.id,
      label: "Casa",
      street: "Rua Getúlio Vargas",
      number: "100",
      district: "Centro",
      city: "Joaçaba",
      state: "SC",
      zipCode: "89600-000",
      isDefault: true,
    });
  }

  console.log(`Seed finished. Users: ${seedUsers.map((user) => user.email).join(", ")}`);
  console.log(`Password for all seed users: ${DEFAULT_PASSWORD}`);
  process.exit(0);
};

await main();
