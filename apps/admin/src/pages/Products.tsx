import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import type { Paginated, Product } from "@eco-market/shared";

import { PageHeader } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

type AdminProduct = Product & { producer: { id: string; name: string }; category: { id: string; name: string } };

export const Products = () => {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const products = useQuery({
    queryKey: ["admin-products", q],
    queryFn: () => api<Paginated<AdminProduct>>("/admin/products", { query: { q, pageSize: 100 } }),
  });
  const toggle = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api(`/admin/products/${id}`, { method: "PATCH", body: { isActive } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  return (
    <>
      <PageHeader title="Produtos" description="Moderação do catálogo">
        <Input placeholder="Buscar produto" className="w-72" value={q} onChange={(e) => setQ(e.target.value)} />
      </PageHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Produtor</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Estoque</TableHead>
            <TableHead>Situação</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.data?.data.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.producer.name}</TableCell>
              <TableCell>{product.category.name}</TableCell>
              <TableCell>{formatCurrency(product.price)}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>
                {product.isActive ? <Badge>Ativo</Badge> : <Badge variant="secondary">Inativo</Badge>}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggle.mutate({ id: product.id, isActive: !product.isActive })}
                >
                  {product.isActive ? "Desativar" : "Ativar"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};
