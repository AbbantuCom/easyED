export const schemeQueryKeys = {
  all: ['schemes'] as const,
  list: (page: number, limit: number) => ['schemes', 'list', page, limit] as const,
  detail: (id: string) => ['schemes', 'detail', id] as const,
  weekOptions: ['schemes', 'week-options'] as const,
};
