function ultimateParser(raw) {
  let jsonString = raw;
  const keys = ["foodPacks", "waterLiters", "medicalKits", "blankets", "tents", "adjustmentReason", "budgetBreakdown", "reasoning", "food", "water", "medical", "other", "vulnerabilityNote", "priorityItems", "durationDays"];

  // 1. Initial Structural Fix
  jsonString = jsonString.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

  // 2. THE SPLIT & SCRUB
  const splitter = new RegExp(`("(?:${keys.join('|')})")\\s*:`, 'g');
  const tokens = jsonString.split(splitter);
  
  if (tokens.length > 2) {
    for (let i = 2; i < tokens.length; i += 2) {
      let valBlock = tokens[i];
      if (valBlock.match(/^\s*\[/)) continue; // Protect arrays

      const firstQ = valBlock.indexOf('"');
      const lastQ = valBlock.lastIndexOf('"');
      if (firstQ !== -1 && lastQ !== -1 && firstQ !== lastQ) {
         const content = valBlock.substring(firstQ + 1, lastQ);
         const scrubbed = content.replace(/"/g, "'");
         tokens[i] = valBlock.substring(0, firstQ + 1) + scrubbed + valBlock.substring(lastQ);
      }
    }
    jsonString = tokens.join(':'); // Join back with colon
  }
  return jsonString;
}

const testCase = '{"reasoning": {"food": "presence of elderly, "children", "evacuees", and injured individuals"}}';
console.log("Input:", testCase);
console.log("Output:", ultimateParser(testCase));
