import { useState } from 'react';

export function usePagination(initialPage = 1, initialSize = 10) {
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);

  return {
    page,
    size,
    setPage,
    setSize,
    offset: (page - 1) * size
  };
}

export default usePagination;
