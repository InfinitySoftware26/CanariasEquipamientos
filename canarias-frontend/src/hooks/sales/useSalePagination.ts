import { useMemo, useState } from "react";

const ITEMS_PER_PAGE = 6;

export function useSalesPagination<T>(items: T[]) {
  const [page, setPage] = useState(1);

  const paginated = useMemo(() => {
    return items.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  }, [items, page]);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);

  return {
    page,
    setPage,
    paginated,
    totalPages,
  };
}
