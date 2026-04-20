function lookaheadScanner(raw) {
  let jsonString = raw;
  const keys = ["foodPacks", "waterLiters", "medicalKits", "blankets", "tents", "adjustmentReason", "budgetBreakdown", "reasoning", "food", "water", "medical", "other", "vulnerabilityNote", "priorityItems", "durationDays"];

  // 1. Normalize Keys
  jsonString = jsonString.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

  // 2. Scan and Scrub
  keys.forEach(k => {
    // This regex finds the key and everything until the next key or end of object
    const nextKeyPattern = keys.filter(nk => nk !== k).join('|');
    const pattern = new RegExp(`("${k}"\\s*:\\s*")([\\s\\S]*?)(?="\\s*[,\\}]|"\\s*,\\s*"(?:${nextKeyPattern})")`, 'g');
    
    jsonString = jsonString.replace(pattern, (full, start, value) => {
       // Everything in 'value' that is a double quote should be a single quote
       return start + value.replace(/"/g, "'");
    });
  });

  return jsonString;
}

const testCase = '{"reasoning": "presence of elderly, "children", "evacuees", and injured individuals", "nextKey": "value"}';
console.log("Input:", testCase);
console.log("Output:", lookaheadScanner(testCase));
