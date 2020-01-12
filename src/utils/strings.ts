const cache: Record<string, string> = {};

function replacer(match: string): string {
  return '-' + match[0].toLowerCase();
}

export function hyphenate(value: string): string {
  return cache[value] || (cache[value] = value.replace(/([A-Z])/g, replacer));
}