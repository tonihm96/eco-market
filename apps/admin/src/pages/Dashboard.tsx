import { useQuery } from "@tanstack/react-query";
import { Package, Receipt, Store, Users, Wallet } from "lucide-react";

import { PageHeader } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

type Stats = { users: number; producers: number; products: number; orders: number; revenue: string };

export const Dashboard = () => {
  const { data } = useQuery({ queryKey: ["stats"], queryFn: () => api<Stats>("/admin/stats") });

  const items = [
    { label: "Usuários", value: data?.users, icon: Users },
    { label: "Produtores", value: data?.producers, icon: Store },
    { label: "Produtos", value: data?.products, icon: Package },
    { label: "Pedidos", value: data?.orders, icon: Receipt },
    { label: "Volume vendido", value: data ? formatCurrency(data.revenue) : undefined, icon: Wallet },
  ];

  return (
    <>
      <PageHeader title="Visão geral" description="Indicadores da plataforma" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {items.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="gap-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{value ?? "..."}</CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};
