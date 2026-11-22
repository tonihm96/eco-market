import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { userRoles, type Paginated, type UserRole } from "@eco-market/shared";

import { PageHeader } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { formatDate, roleLabels } from "@/lib/format";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  banned: boolean;
  createdAt: string;
};

export const Users = () => {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const [q, setQ] = useState("");
  const users = useQuery({
    queryKey: ["admin-users", q],
    queryFn: () => api<Paginated<AdminUser>>("/admin/users", { query: { q, pageSize: 100 } }),
  });
  const update = useMutation({
    mutationFn: ({ id, ...body }: { id: string; role?: UserRole; banned?: boolean }) =>
      api(`/admin/users/${id}`, { method: "PATCH", body }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  return (
    <>
      <PageHeader title="Usuários" description="Consumidores, produtores e administradores">
        <Input placeholder="Buscar por nome ou e-mail" className="w-72" value={q} onChange={(e) => setQ(e.target.value)} />
      </PageHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead>Situação</TableHead>
            <TableHead>Cadastro</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.data?.data.map((user) => {
            const isSelf = user.id === session?.user.id;
            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    disabled={isSelf}
                    onChange={(e) => update.mutate({ id: user.id, role: e.target.value as UserRole })}
                  >
                    {userRoles.map((role) => (
                      <option key={role} value={role}>
                        {roleLabels[role]}
                      </option>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  {user.banned ? (
                    <Badge variant="destructive">Bloqueado</Badge>
                  ) : user.emailVerified ? (
                    <Badge>Ativo</Badge>
                  ) : (
                    <Badge variant="secondary">E-mail pendente</Badge>
                  )}
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant={user.banned ? "outline" : "destructive"}
                    disabled={isSelf}
                    onClick={() => update.mutate({ id: user.id, banned: !user.banned })}
                  >
                    {user.banned ? "Desbloquear" : "Bloquear"}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};
