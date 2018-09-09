var cache = {};
export function hyphenate(value: string): string {
    return cache[value] || (cache[value] = value.replace(/([A-Z])/g, replacer));
}

function replacer(match: any): string {
    return "-" + match[0].toLowerCase();
}
