export const lessonQueryKeys = {
  all: ['lessons'] as const,
  list: (page: number, limit: number) => ['lessons', 'list', page, limit] as const,
  detail: (id: string) => ['lessons', 'detail', id] as const,
};
