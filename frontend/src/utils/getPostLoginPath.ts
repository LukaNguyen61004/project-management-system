/** After login, avoid redirecting into /projects/:id — user may not be a member yet. */
export function getPostLoginPath(redirect: string | null): string {
  const target = redirect || '/projects'
  if (/^\/projects\/\d+/.test(target)) return '/projects'
  return target
}
