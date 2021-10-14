export function fixCodeIndents(rawCode: string, indent: string): string {
    const code = rawCode.trim();
    if (!indent) {
        return code;
    }

    const lines = code.split('\n');
    const indented = lines.map((line) => {
        if (line.trim()) {
            return `${indent}${line}`;
        } else {
            return '';
        }
    });

    const joined = indented.join('\n');
    return joined;
}
