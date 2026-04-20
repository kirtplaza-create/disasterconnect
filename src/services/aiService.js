/**
 * AI SERVICE - DisasterConnect
 */

/**
 * AI JSON Parser - PHASE 23 (BOUNDARY-AWARE VALUE REPAIR)
 * Definitively handles unescaped quotes in values by identifying structural boundaries.
 */
export function parseAIJSON(raw) {
  if (!raw) throw new Error("AI returned empty response");

  // 1. Initial Sanitization
  let json = raw
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim();

  // Extract first valid JSON structure
  const start = json.search(/\{|\[/);
  const end = Math.max(json.lastIndexOf('}'), json.lastIndexOf(']'));
  if (start === -1) throw new Error("No JSON found");
  json = json.substring(start, end + 1);

  // 2. Pre-Repair: Structural Normalization
  // Fix missing commas between blocks
  json = json.replace(/}\s*"/g, '}, "').replace(/]\s*"/g, '], "');
  // Ensure all keys are double-quoted
  json = json.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

  // 3. Surgical Repair: Escaping internal quotes in string values
  // Strategy: Identify "key": "value", boundaries and repair everything between them
  const markers = [];
  const keyRegex = /"([^"]+)"\s*:/g;
  let match;
  while ((match = keyRegex.exec(json)) !== null) {
    markers.push({ index: match.index, length: match[0].length, key: match[1] });
  }

  if (markers.length > 0) {
    let repaired = json.substring(0, markers[0].index + markers[0].length);
    for (let i = 0; i < markers.length; i++) {
      const startVal = markers[i].index + markers[i].length;
      const endVal = (i + 1 < markers.length) ? markers[i + 1].index : json.length;

      let block = json.substring(startVal, endVal);

      // If this block looks like a string (contains quotes), repair it
      const firstQ = block.indexOf('"');
      const lastQ = block.lastIndexOf('"');

      if (firstQ !== -1 && lastQ !== -1 && firstQ !== lastQ) {
        const prefix = block.substring(0, firstQ + 1);
        const content = block.substring(firstQ + 1, lastQ);
        const suffix = block.substring(lastQ);
        // Replace internal double quotes with single quotes to preserve JSON structure
        block = prefix + content.replace(/"/g, "'") + suffix;
      }

      repaired += block;
      if (i + 1 < markers.length) repaired += json.substring(markers[i + 1].index, markers[i + 1].index + markers[i + 1].length);
    }
    json = repaired;
  }

  // 4. Final Polish
  json = json
    .replace(/,\s*}/g, '}')
    .replace(/,\s*]/g, ']')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ');

  try {
    return JSON.parse(json);
  } catch (e) {
    // Stage 5: Structural Repair & Balancing
    // A. Fix missing commas between objects/arrays
    json = json
      .replace(/\}\s*\{/g, '}, {')
      .replace(/\]\s*\[/g, '], [')
      .replace(/\}\s*\[/g, '}, [')
      .replace(/\]\s*\{/g, '], {');

    // B. Balance Braces and Brackets (LIFO Stack, Quote-Aware)
    const stack = [];
    let balanced = "";
    let inString = false;
    let escaped = false;

    for (let i = 0; i < json.length; i++) {
        const char = json[i];
        
        if (escaped) {
          escaped = false;
        } else if (char === '\\') {
          escaped = true;
        } else if (char === '"') {
          inString = !inString;
        }

        if (!inString) {
          if (char === '{' || char === '[') stack.push(char === '{' ? '}' : ']');
          else if (char === '}' || char === ']') {
              if (stack.length > 0 && stack[stack.length - 1] === char) stack.pop();
          }
        }
        balanced += char;
    }
    
    // Final check for unclosed string
    if (inString) balanced += '"';

    // Close remaining open structures in reverse order
    while (stack.length > 0) {
        balanced += stack.pop();
    }
    json = balanced;

    try {
      return JSON.parse(json);
    } catch (err) {
      throw new Error(`Parse Error: ${err.message}. Position suggested: ${err.at || 'unknown'}. Input length: ${json.length}`);
    }
  }
}

export async function askAI(system, prompt) {
  try {
    console.log(`[AI SERVICE] askAI started for model llama3.1. Waiting for response...`);
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.1:latest',
        system: system,
        prompt: prompt,
        stream: false,
        format: 'json',
        options: {
          temperature: 0.1,
          num_predict: 4096,
          top_p: 0.9,
          repeat_penalty: 1.1
        }
      })
    });

    if (!response.ok) throw new Error(`Ollama Error: ${response.statusText}`);
    const data = await response.json();
    console.log(`[AI SERVICE] askAI response received, length: ${data.response?.length}`);
    return data.response;
  } catch (err) {
    console.error(`[AI SERVICE] askAI critical failure:`, err);
    throw err;
  }
}

export const getStatusColor = (status) => {
  const map = { 
    'pending': 'var(--color-warn)', 
    'approved': 'var(--color-accent)', 
    'distributed': 'var(--color-success)', 
    'rejected': 'var(--color-danger)', 
    'critical': 'var(--color-danger)' 
  }
  return map[status?.toLowerCase()] || 'var(--text-secondary)'
}
