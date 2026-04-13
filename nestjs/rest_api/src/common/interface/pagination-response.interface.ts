export interface PaginationMetaFormat {
  currentPage: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  metadata: PaginationMetaFormat;
}
