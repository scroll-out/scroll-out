var cache = {};
export function hyphenate(value) {
    return cache[value] ||(cache[value] = value.replace(/([A-Z])/g, replacer));
}

function replacer(match) {
    return '-' + match[0].toLowerCase()
}
