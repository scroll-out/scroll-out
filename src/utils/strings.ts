const cache: Record<string, string> = {};
export function hyphenate(value: string): string {
  return cache[value] || (cache[value] = value.replace(/([A-Z])/g, replacer));
}

function replacer(match: string): string {
  return '-' + match[0].toLowerCase();
}
