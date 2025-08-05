export interface Issue {
    from: number;
    to: number;
    type: string;
    text: string;
    tip: string;
}

export function lint(text: string): Issue[] {
    const issues: Issue[] = [];
    const passive = /\b(is|are|was|were|be|been|being)\s+\w*ed\b/gi;
    const adverb = /\b\w+ly\b/gi;
    const long = /[^.!?]{25,}[.!?]/g;

    let m;
    while ((m = passive.exec(text))) {
        issues.push({ from: m.index, to: passive.lastIndex, type: "passive", text: m[0], tip: "Use active voice." });
    }
    while ((m = adverb.exec(text))) {
        issues.push({ from: m.index, to: adverb.lastIndex, type: "adverb", text: m[0], tip: "Strong verbs beat adverbs." });
    }
    while ((m = long.exec(text))) {
        issues.push({ from: m.index, to: long.lastIndex, type: "long", text: m[0], tip: "Sentence is hard to read." });
    }
    return issues;
}