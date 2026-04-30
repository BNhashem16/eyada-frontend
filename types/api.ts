/**
 * Generic paginated response envelope.
 *
 * The backend wraps list endpoints in `{ items, meta: { total, page, limit, totalPages } }`.
 * `apiGet` strips the outer `{ success, data }` envelope; this type describes
 * what's left.
 */
export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginatedMeta;
}

/**
 * Standard list filters reused across pharmacy resources.
 */
export interface ListFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}
