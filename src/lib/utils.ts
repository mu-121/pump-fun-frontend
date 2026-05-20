/**
 * Tiny classNames merger — concatenates truthy class strings.
 * Avoids the extra clsx/tailwind-merge dependency for a project this size.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

/** Copy text to clipboard; resolves true on success. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
