import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import type { ProductCategory } from "@eco-market/shared";

import { PageHeader } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";

export const Categories = () => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const categories = useQuery({ queryKey: ["categories"], queryFn: () => api<ProductCategory[]>("/categories") });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["categories"] });
  const create = useMutation({
    mutationFn: () => api("/categories", { method: "POST", body: { name, description: description || null } }),
    onSuccess: () => {
      setName("");
      setDescription("");
      invalidate();
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => api(`/categories/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    create.mutate();
  };

  return (
    <>
      <PageHeader title="Categorias" description="Categorias usadas pelos produtores no cadastro de produtos" />
      <form onSubmit={onSubmit} className="mb-4 flex gap-2">
        <Input placeholder="Nome" className="w-60" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
        <Input placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Button type="submit" disabled={create.isPending}>
          Adicionar
        </Button>
      </form>
      {remove.isError ? (
        <p className="mb-2 text-sm text-destructive">Não é possível remover categorias com produtos vinculados.</p>
      ) : null}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.data?.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell>{category.description}</TableCell>
              <TableCell className="text-right">
                <Button size="icon" variant="ghost" onClick={() => remove.mutate(category.id)} aria-label="Remover">
                  <Trash2 />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};
