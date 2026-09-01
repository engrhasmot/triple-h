export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers || {});
  return fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
}
