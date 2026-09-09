export function parsePagination(request: Request): { page: number; limit: number } {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') ?? '20') || 20));
  return { page, limit };
}
