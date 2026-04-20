function structuralScanner(raw) {
    let text = raw.trim();
    const knownKeys = ["foodPacks", "waterLiters", "medicalKits", "blankets", "tents", "adjustmentReason", "budgetBreakdown", "reasoning", "food", "water", "medical", "other", "vulnerabilityNote", "priorityItems", "durationDays"];

    // 1. Identify all POTENTIAL structural points
    // A structural point is '"key":'
    const markers = [];
    const keyRegex = /"([a-zA-Z0-9_\s]+)"\s*:/g;
    let match;
    while ((match = keyRegex.exec(text)) !== null) {
        // Double check: is it preceded by { or , ?
        const prevText = text.substring(Math.max(0, match.index - 5), match.index).trim();
        if (match.index === 0 || prevText.endsWith('{') || prevText.endsWith(',') || prevText.endsWith('[')) {
             markers.push({
                 index: match.index,
                 key: match[1],
                 full: match[0],
                 length: match[0].length
             });
        }
    }

    if (markers.length === 0) return text;

    // 2. We now have a list of GUARANTEED structural boundaries.
    // The content between markers[i].index + markers[i].length and markers[i+1].index 
    // is a VALUE block.
    let result = text.substring(0, markers[0].index + markers[0].length);

    for (let i = 0; i < markers.length; i++) {
        const valueStart = markers[i].index + markers[i].length;
        const valueEnd = (i + 1 < markers.length) ? markers[i+1].index : text.length;
        
        let valueBlock = text.substring(valueStart, valueEnd).trim();
        
        // Scrub all double quotes inside this block EXCEPT the outer ones
        // But values don't always have outer ones yet (if unquoted)
        const firstQ = valueBlock.indexOf('"');
        const lastQ = valueBlock.lastIndexOf('"');

        if (firstQ !== -1 && lastQ !== -1 && firstQ !== lastQ) {
            const prefix = valueBlock.substring(0, firstQ + 1);
            const content = valueBlock.substring(firstQ + 1, lastQ);
            const suffix = valueBlock.substring(lastQ);
            valueBlock = prefix + content.replace(/"/g, "'") + suffix;
        } else if (firstQ === -1 && !valueBlock.match(/^-?\d|true|false|null|\[/)) {
            // Unquoted string! Wrap it.
            // Be careful to preserve the trailing comma if it exists
            const commaIdx = valueBlock.lastIndexOf(',');
            if (commaIdx !== -1 && commaIdx > valueBlock.length - 5) {
                 const core = valueBlock.substring(0, commaIdx).trim();
                 valueBlock = `"${core.replace(/"/g, "'")}"` + valueBlock.substring(commaIdx);
            } else {
                 valueBlock = `"${valueBlock.replace(/"/g, "'")}"`;
            }
        }

        result += valueBlock;
        if (i + 1 < markers.length) {
            result += markers[i+1].full;
        }
    }

    return result;
}

const input = '{"reasoning": "We have 215 people, "including 61 families", requires help.", "food": 100}';
console.log("Input:", input);
const output = structuralScanner(input);
console.log("Output:", output);

try {
    JSON.parse(output);
    console.log("✅ PARSE SUCCESS!");
} catch (e) {
    console.log("❌ PARSE FAILED:", e.message);
}
