export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

interface ApiFetchOptions {
  method?: string;
  body?: unknown;
  searchParams?: Record<string, string | number | undefined>;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = 'GET', body, searchParams } = options;

  let url = path;
  if (searchParams) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined) params.set(key, String(value));
    }
    const query = params.toString();
    if (query) url += `?${query}`;
  }

  const response = await fetch(url, {
    method,
    credentials: 'include',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message =
      (data && (data.error as string)) ||
      (data?.errors ? 'Please fix the highlighted fields.' : 'Something went wrong.');
    throw new ApiError(message, response.status, data?.errors);
  }

  return data as T;
}
