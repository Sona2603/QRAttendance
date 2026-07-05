import { useState } from 'react'

export function usePagination(initialPage = 1) {
  const [page, setPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(1)
  const [count, setCount] = useState(0)

  const handleResponse = (data) => {
    setCount(data.count || 0)
    setTotalPages(Math.ceil((data.count || 0) / 20))
  }

  return { page, setPage, totalPages, count, handleResponse }
}
