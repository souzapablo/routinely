// "/api", "/api/..." and "/api?..." belong to the API; "/apiary" does not.
// The built server and the dev proxy both use this, so they split paths
// the same way.
export const apiPathPattern = /^\/api(?:[/?]|$)/;

export function isApiPath(url: string): boolean {
  return apiPathPattern.test(url);
}
