export interface PaginatorConfig {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface PageChangeEvent {
  page: number;
  limit: number;
}