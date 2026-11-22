import type { Paginated, PaginationQuery } from "@eco-market/shared";

export const toOffset = ({ page, pageSize }: PaginationQuery) => (page - 1) * pageSize;

export const paginate = <T>(
  data: T[],
  total: number,
  { page, pageSize }: PaginationQuery,
): Paginated<T> => ({ data, total, page, pageSize });
