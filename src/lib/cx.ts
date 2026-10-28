/** Joins CSS class names and skips empty ones: cx('a', isOn && 'b') → 'a b' or 'a'. */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
