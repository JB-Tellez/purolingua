// src/lib/reloadPage.ts
// Full page reload, kept in its own module so tests can mock it (jsdom does not
// allow stubbing location.reload).
export function reloadPage(location: Pick<Location, 'reload'> = window.location): void {
  location.reload();
}
