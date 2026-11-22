import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { orderStatuses, type Order, type OrderStatus, type Paginated } from "@eco-market/shared";

import { PageHeader } from "@/components/Layout";
import { Select } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatCurrency, formatDate, orderStatusLabels } from "@/lib/format";

export const Orders = () => {
  const queryClient = useQueryClient();
  const orders = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => api<Paginated<Order>>("/admin/orders", { query: { pageSize: 100 } }),
  });
  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      api(`/admin/orders/${id}/status`, { method: "PATCH", body: { status } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-orders"] }),
  });

  return (
    <>
      <PageHeader title="Pedidos" description="Acompanhamento de todos os pedidos da plataforma" />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Produtor</TableHead>
            <TableHead>Itens</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.data?.data.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{formatDate(order.createdAt)}</TableCell>
              <TableCell>{order.customer?.name}</TableCell>
              <TableCell>{order.producer?.name}</TableCell>
              <TableCell className="max-w-64 truncate">
                {order.items.map((item) => `${item.quantity}x ${item.productName}`).join(", ")}
              </TableCell>
              <TableCell>{order.payment ? `${order.payment.method} (${order.payment.provider})` : "-"}</TableCell>
              <TableCell>{formatCurrency(order.total)}</TableCell>
              <TableCell>
                <Select
                  value={order.status}
                  onChange={(e) => update.mutate({ id: order.id, status: e.target.value as OrderStatus })}
                >
                  {orderStatuses.map((status) => (
                    <option key={status} value={status}>
                      {orderStatusLabels[status]}
                    </option>
                  ))}
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};
